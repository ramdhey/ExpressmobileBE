const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const transporter = require("../config/nodemailer");
require("dotenv").config();
const convertImageToBase64 = (imagePath) => {
  // Pastikan jalur gambar relatif terhadap lokasi file ini
  const absolutePath = path.join(__dirname, imagePath);
  const imageAsBase64 = fs.readFileSync(absolutePath, "base64");
  const imageAsBase64_2 = fs.readFileSync(absolutePath, "base64");
  return `data:image/png;base64,${imageAsBase64}`;
  return `data:image/png;base64,${imageAsBase64_2}`;
};
const imageBase64 = convertImageToBase64("../assets/templt.png");
const imageBase64_2 = convertImageToBase64("../assets/JDL.png");
exports.registerAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      status: 201,
      message: "Admin Berhasil di Buat",
      data: newAdmin,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: 500, message: "Error registering admin", error });
  }
};

exports.registerUser = async (req, res) => {
  const { fullName, email, password } = req.body; // Pastikan email ada di sini
  const username = fullName.replace(/\s/g, "").substring(0, 6).toLowerCase();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const ServerUrl = process.env.SERVER_URL; // Mengambil Server URL dari environment variable
    const avatarPath = req.file ? `/uploads/${req.file.filename}` : "";
    const avatarURL = `${ServerUrl}${avatarPath}`;

    const confirmationToken = jwt.sign(
      { email }, // Pastikan email dikirim ke sini
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const newUser = await User.create({
      fullname: fullName,
      email, // Tambahkan email ke sini
      username,
      password: hashedPassword,
      photo: avatarURL,
      confirmation_token: confirmationToken,
      token_expiration: Date.now() + 3600000, // 1 hour in milliseconds
      status: false,
    });

    const mailOptions = {
      from: '"Register Verification"',
      to: email,
      subject: "Verify Your Email",
      html: `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Menambahkan style yang tidak inline di sini dapat meningkatkan responsivitas
       di klien email yang mendukung media queries, seperti Apple Mail dan beberapa lainnya. */
    @media screen and (max-width: 600px) {
      .button {
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 10px 0 30px 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; border: 1px solid #cccccc;">
          <tr>
            <td align="center" bgcolor="#007bff" style="padding: 40px 0 30px 0; color: #ffffff; font-size: 28px; font-weight: bold; font-family: Arial, sans-serif;">
              Verifikasi Akun Anda
            </td>
          </tr>
          <tr>
            <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="color: #153643; font-family: Arial, sans-serif;">
                    <h1 style="font-size: 24px; margin: 0;">Halo ${fullName},</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 0 30px 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                    Terima kasih telah mendaftar. Silakan klik tombol di bawah ini untuk memverifikasi akun Anda.
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="${ServerUrl}/confirm/${confirmationToken}" class="button" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verifikasi Akun</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td bgcolor="#ee4c50" style="padding: 30px 30px 30px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" align="center">
                    Jika Anda tidak merasa mendaftar di layanan kami, silakan abaikan email ini.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

  `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      status: 201,
      message:
        "User Berhasil di Buat, silakan cek email Anda untuk verifikasi.",
      data: newUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: 500, message: "Error registering user", error });
  }
};

exports.confirmEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      where: { email: decoded.email, confirmation_token: token },
    });

    // Cek apakah token telah kedaluwarsa
    if (!user || user.token_expiration < Date.now()) {
      const responseHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
              text-align: center;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 20px;
              padding: 20px;
              background: #fff;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .message {
              font-size: 1.2em;
            }
            .image {
              max-width: 100%;
              height: auto;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${imageBase64}" alt="Header Image" style="width: 100%; max-width: 600px; height: auto;">
           <div style="display: flex; align-items: flex-start;">
  <img src="${imageBase64_2}" alt="Title Image" style="width: 35%; max-width: 600px; height: auto;">
</div>

            <p class="message">Hallo Sobat,Mohon maaf token mu sudah kedaluwarsa atau Token mu salah sehingga, akun mu tidak dapat di verfikasi.</p>
          </div>
        </body>
        </html>
      `;
      res.status(400).json({
        status: 400,
        message: responseHTML,
        data: null,
      });
    } else {
      // Update status pengguna
      user.confirmed = true;
      user.confirmation_token = null;
      user.token_expiration = null;
      await user.save();

      const responseHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
              text-align: center;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 20px;
              padding: 20px;
              background: #fff;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .message {
              font-size: 1.2em;
            }
            .image {
              max-width: 100%;
              height: auto;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${imageBase64}" alt="Header Image" style="width: 100%; max-width: 600px; height: auto;">
           <div style="display: flex; align-items: flex-start;">
  <img src="${imageBase64_2}" alt="Title Image" style="width: 35%; max-width: 600px; height: auto;">
</div>

            <p class="message">Hallo Sobat,Selamat Akun mu telah berhasil di verifikasi. Selalu sehat ya, agar hari mu seindah ucapan dikala senja.</p>
          </div>
        </body>
        </html>
      `;

      res.send(responseHTML);
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: 500, message: "Error saat konfirmasi email", error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cek apakah user atau admin
    console.log("Mencari admin dengan email:", email);
    let user = await Admin.findOne({ where: { email } });
    console.log("Hasil pencarian admin:", user);

    if (!user) {
      console.log("Mencari user dengan email:", email);
      user = await User.findOne({ where: { email } });
      console.log("Hasil pencarian user:", user);

      // Pengecekan status hanya dilakukan jika user ditemukan
      if (user && !user.status) {
        return res
          .status(400)
          .json({ status: 400, message: "Akun tidak aktif" });
      }
    }

    if (!user) {
      return res
        .status(400)
        .json({ status: 400, message: "Email atau Password salah" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ status: 400, message: "Email atau Password salah" });
    }

    const role = user instanceof Admin ? "admin" : "user";
    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      status: 200,
      message: "Login berhasil",
      token,
      role,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: "Error saat login", error });
  }
};

// Get Profile untuk User atau Admin
exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "fullname",
        "email",
        "username",
        "role",
        "photo",
        "status",
      ], // Tambahkan status ke dalam atribut yang ditampilkan
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Profil tidak ditemukan",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Profil berhasil diambil",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Error saat mengambil profil",
      error,
    });
  }
};

exports.getListUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "fullname",
        "email",
        "username",
        "role",
        "status",
        "photo",
      ], // Pilih atribut yang ingin ditampilkan
      where: { role: "user" }, // Hanya ambil user dengan role "user"
    });

    if (!users.length) {
      return res.status(404).json({
        status: 404,
        message: "Tidak ada pengguna yang ditemukan.",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Daftar pengguna berhasil diambil",
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Error saat mengambil daftar pengguna",
      error,
    });
  }
};

exports.editProfile = async (req, res) => {
  const userId = req.user.id;
  const { fullName } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Temukan pengguna berdasarkan ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Pengguna tidak ditemukan",
      });
    }

    // Update nama lengkap dan photo (jika ada)
    if (fullName) {
      user.fullname = fullName;
    }
    if (photo) {
      user.photo = `${process.env.SERVER_URL}${photo}`;
    }

    await user.save();

    res.status(200).json({
      status: 200,
      message: "Profil berhasil diperbarui",
      data: {
        fullname: user.fullname,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Error saat memperbarui profil",
      error,
    });
  }
};

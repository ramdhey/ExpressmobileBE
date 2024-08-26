const Application = require("../models/Application");
const User = require("../models/User");

// User mengirimkan data lamaran
exports.createApplication = async (req, res) => {
  const {
    position_applied,
    name,
    ktp_number,
    place_of_birth,
    date_of_birth,
    gender,
    religion,
    blood_type,
    marital_status,
    address_ktp,
    address_current,
    email,
    phone_number,
    emergency_contact,
    education_details,
    training_history,
    work_experience,
    skills,
    relocation,
    expected_salary,
  } = req.body;
  const userId = req.user.id;

  try {
    // Cek apakah user sudah pernah mengirimkan lamaran
    let application = await Application.findOne({ where: { userId } });

    if (application) {
      // Jika sudah ada, update data lamaran
      await application.update({
        position_applied,
        name,
        ktp_number,
        place_of_birth,
        date_of_birth,
        gender,
        religion,
        blood_type,
        marital_status,
        address_ktp,
        address_current,
        email,
        phone_number,
        emergency_contact,
        education_details,
        training_history,
        work_experience,
        skills,
        relocation,
        expected_salary,
        status: "waiting", // Reset status jika perlu
      });

      return res.status(200).json({
        status: 200,
        message: "Lamaran berhasil diperbarui",
        data: application,
      });
    }

    // Jika belum ada, buat lamaran baru
    const newApplication = await Application.create({
      position_applied,
      name,
      ktp_number,
      place_of_birth,
      date_of_birth,
      gender,
      religion,
      blood_type,
      marital_status,
      address_ktp,
      address_current,
      email,
      phone_number,
      emergency_contact,
      education_details,
      training_history,
      work_experience,
      skills,
      relocation,
      expected_salary,
      status: "waiting",
      userId,
    });

    res.status(201).json({
      status: 201,
      message: "Lamaran berhasil dikirim",
      data: newApplication,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: 500, message: "Error saat mengirim lamaran", error });
  }
};



// User melihat daftar lamarannya sendiri
exports.getUserApplications = async (req, res) => {
  const userId = req.user.id;

  try {
    const applications = await Application.findAll({ where: { userId } });

    if (!applications.length) {
      return res.status(404).json({
        status: 404,
        message: "Tidak ada lamaran yang ditemukan untuk user ini.",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Daftar lamaran berhasil diambil",
      data: applications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Error saat mengambil daftar lamaran",
      error,
    });
  }
};

// Admin melihat semua lamaran
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.findAll();

    if (!applications.length) {
      return res.status(404).json({
        status: 404,
        message: "Tidak ada lamaran yang ditemukan.",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Daftar semua lamaran berhasil diambil",
      data: applications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Error saat mengambil daftar lamaran",
      error,
    });
  }
};

// User melihat detail lamaran berdasarkan ID
exports.getApplicationById = async (req, res) => {
  const userId = req.user.id;

  try {
    const application = await Application.findOne({ where: { userId } });

    if (!application) {
      return res.status(404).json({
        status: 404,
        message: "Lamaran tidak ditemukan untuk pengguna ini.",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Detail lamaran berhasil diambil",
      data: application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Error saat mengambil detail lamaran",
      error,
    });
  }
};


// Admin melihat detail lamaran berdasarkan ID tanpa batasan userId
exports.getApplicationByIdForAdmin = async (req, res) => {
  const { id } = req.params; // id di sini adalah userId, bukan id aplikasi

  try {
    // Cari aplikasi berdasarkan userId
    const application = await Application.findOne({ where: { userId: id } });

    if (!application) {
      return res
        .status(404)
        .json({
          status: 404,
          message: "Lamaran tidak ditemukan untuk pengguna ini.",
        });
    }

    res.status(200).json({
      status: 200,
      message: "Detail lamaran berhasil diambil",
      data: application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Error saat mengambil detail lamaran",
      error,
    });
  }
};



exports.updateApplicationStatus = async (req, res) => {
  const { id } = req.params; // ID dari user yang akan diupdate
  const { status } = req.body; // Status baru (true atau false)

  try {
    const user = await User.findByPk(id); // Cari user berdasarkan ID

    if (!user) {
      return res
        .status(404)
        .json({ status: 404, message: "User tidak ditemukan" });
    }

    // Update status user (true atau false)
    user.status = status;
    await user.save();

    res.status(200).json({
      status: 200,
      message: "Status user berhasil diperbarui",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Error saat memperbarui status user",
      error,
    });
  }
};

exports.editApplication = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const application = await Application.findByPk(id);

    if (!application) {
      return res
        .status(404)
        .json({ status: 404, message: "Lamaran tidak ditemukan" });
    }

    const allowedFields = [
      "name",
      "place_of_birth",
      "date_of_birth",
      "position_applied",
      "status",
    ];
    const updateFields = {};

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updateFields[field] = updates[field];
      }
    });

    await application.update(updateFields);

    res.status(200).json({
      status: 200,
      message: "Lamaran berhasil diperbarui",
      data: application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Error saat memperbarui lamaran",
      error,
    });
  }
};

exports.editApplicationForUser = async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  try {
    const application = await Application.findOne({ where: { userId } });

    if (!application) {
      return res.status(404).json({
        status: 404,
        message: "Lamaran tidak ditemukan untuk pengguna ini.",
      });
    }

    const allowedFields = [
      "position_applied",
      "name",
      "ktp_number",
      "place_of_birth",
      "date_of_birth",
      "gender",
      "religion",
      "blood_type",
      "marital_status",
      "address_ktp",
      "address_current",
      "email",
      "phone_number",
      "emergency_contact",
      "education_details",
      "training_history",
      "work_experience",
      "skills",
      "relocation",
      "expected_salary",
    ];

    const updateFields = {};

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updateFields[field] = updates[field];
      }
    });

    await application.update(updateFields);

    res.status(200).json({
      status: 200,
      message: "Lamaran berhasil diperbarui",
      data: application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Error saat memperbarui lamaran",
      error,
    });
  }
};

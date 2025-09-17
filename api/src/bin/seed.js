import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { config } from "../lib/config.js";
import { connectDB } from "../lib/db.js";
import User from "../lib/models/user.model.js";
import Job from "../lib/models/job.model.js";

const seed = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Job.deleteMany();

    const passwordHash = await bcrypt.hash("123456", 10);

    const employers = await User.insertMany([
      { name: "Empresa Uno", age: 40, socialSecurityNumber: "111111111", email: "empresa1@test.com", passwordHash, role: "employer" },
      { name: "Empresa Dos", age: 38, socialSecurityNumber: "222222222", email: "empresa2@test.com", passwordHash, role: "employer" },
      { name: "Empresa Tres", age: 45, socialSecurityNumber: "333333333", email: "empresa3@test.com", passwordHash, role: "employer" },
    ]);

    await User.insertMany([
      { name: "Trabajador Uno", age: 25, socialSecurityNumber: "444444444", email: "worker1@test.com", passwordHash, role: "worker" },
      { name: "Trabajador Dos", age: 30, socialSecurityNumber: "555555555", email: "worker2@test.com", passwordHash, role: "worker" },
      { name: "Trabajador Tres", age: 28, socialSecurityNumber: "666666666", email: "worker3@test.com", passwordHash, role: "worker" },
      { name: "Trabajador Cuatro", age: 35, socialSecurityNumber: "777777777", email: "worker4@test.com", passwordHash, role: "worker" },
      { name: "Trabajador Cinco", age: 22, socialSecurityNumber: "888888888", email: "worker5@test.com", passwordHash, role: "worker" },
    ]);

    await Job.insertMany([
      { title: "Camarero para evento", descriptionMarkdown: "Trabajo en **evento** de empresa", employer: employers[0]._id, date: new Date(), durationHours: 5, maxApplicants: 3 },
      { title: "Diseñador gráfico", descriptionMarkdown: "Se busca experiencia en **Photoshop**", employer: employers[1]._id, date: new Date(), durationHours: 8, maxApplicants: 2 },
      { title: "Repartidor", descriptionMarkdown: "Reparto de pedidos locales", employer: employers[2]._id, date: new Date(), durationHours: 6, maxApplicants: 4 },
      { title: "Promotor comercial", descriptionMarkdown: "Promoción en centros comerciales", employer: employers[0]._id, date: new Date(), durationHours: 7, maxApplicants: 5 },
    ]);

    console.log("Base de datos inicializada con éxito ✅");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error en seed:", err);
    mongoose.connection.close();
  }
};

seed();

import { Response } from "express";
import { prisma } from "../../prismaClient";

export const getDashboardStats = async (res: Response) => {
  try {
    // 1. Get total counts
    const totalPatients = await prisma.patient.count({ where: { isDeleted: false } });
    const totalDoctors = await prisma.doctor.count({ where: { isDeleted: false } });
    const totalAppointments = await prisma.appointment.count();
    const totalServices = await prisma.service.count({ where: { isDeleted: false } });

    // 2. Financial totals (ex: false -> Income, ex: true -> Expense)
    const incomeAgg = await prisma.invoice.aggregate({
      _sum: { total: true },
      where: { ex: false },
    });

    const expenseAgg = await prisma.invoice.aggregate({
      _sum: { total: true },
      where: { ex: true },
    });

    const totalIncome = Number(incomeAgg._sum.total || 0);
    const totalExpenses = Number(expenseAgg._sum.total || 0);

    // 3. Fetch monthly trend data for current year (Jan-Dec)
    const JSDate: any = globalThis.Date;
    const now = new JSDate();
    const currentYear = now.getFullYear();
    const monthlyTrendMap: Record<number, { month: string; income: number; expenses: number }> = {};

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 0; i < 12; i++) {
      monthlyTrendMap[i] = { month: monthNames[i], income: 0, expenses: 0 };
    }

    const startOfYear: any = new JSDate(currentYear, 0, 1);
    const endOfYear: any = new JSDate(currentYear, 11, 31, 23, 59, 59);

    const invoicesThisYear = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    });

    for (const inv of invoicesThisYear) {
      const monthIdx = new JSDate(inv.createdAt).getMonth();
      const amt = Number(inv.total || 0);
      if (inv.ex) {
        monthlyTrendMap[monthIdx].expenses += amt;
      } else {
        monthlyTrendMap[monthIdx].income += amt;
      }
    }

    const chartData = Object.values(monthlyTrendMap);

    // 4. Fetch upcoming appointments
    const upcomingAppointments = await prisma.appointment.findMany({
      take: 10,
      orderBy: { dateTime: "asc" },
      include: {
        patient: { select: { name: true, phone: true } },
        schedule: {
          include: {
            doctor: { select: { name: true } },
            service: { select: { title: true } },
          },
        },
      },
    });

    // 5. Unique appointment dates for calendar view
    const appointmentDates = upcomingAppointments.map(
      (app: any) => new JSDate(app.dateTime).toISOString().split("T")[0]
    );

    return res.status(200).json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalServices,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      chartData,
      appointmentDates: Array.from(new Set(appointmentDates)),
      upcomingAppointments,
    });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

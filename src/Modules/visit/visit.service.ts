import { prisma } from "../../prismaClient";
import ApiFeatures from "../../utils/ApiFeatures";
import { Decimal } from "@prisma/client/runtime/library";

export const fetchPriceForSchedule = async (scheduleId: number) => {
  let schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
  });
  return schedule?.price;
};

export const createVisit = async (
  total: any,
  paymentMethod: any,
  req: any,
  visitDetailsWithPrices: any
) => {
  return await prisma.$transaction(async (prisma) => {
    // Create a Visit record
    const visit = await prisma.visit.create({
      data: {
        total,
        paymentMethod, // Or dynamically set based on request
        createdBy: req.user?.id || 0,
      },
    });

    // Create visit details
    const createdVisitDetails = await Promise.all(
      visitDetailsWithPrices.map(async (detail: any) =>
        prisma.visitDetail.create({
          data: {
            visitId: visit.id,
            patientId: detail.patientId,
            price: detail.price,
            scheduleId: detail.scheduleId,
            dateId: detail.dateId,
            createdBy: req.user?.id || 0,
          },
        })
      )
    );

    // Create invoice with a unique RF (reference)
    const invoice = await prisma.invoice.create({
      data: {
        total,
        ex: true,
        paymentMethod,
        createdBy: req.user?.id || 0,
      },
    });

    // Link visit and invoice
    await prisma.visitInvoice.create({
      data: {
        visitId: visit.id,
        invoiceId: invoice.id,
        createdBy: req.user?.id || 0,
      },
    });

    // Create invoice details linked to visit details
    const createdInvoiceDetails = await Promise.all(
      createdVisitDetails.map((visitDetail) =>
        prisma.invoiceDetail.create({
          data: {
            description: `Detail for schedule ${visitDetail.scheduleId}`, // Customize description as needed
            amount: visitDetail.price,
            invoiceId: invoice.id,
            visitDetailsId: visitDetail.id, // Link InvoiceDetail to VisitDetail
            createdBy: req.user?.id || 0,
          },
        })
      )
    );

    return { visit, createdVisitDetails, invoice, createdInvoiceDetails };
  });
};

export const updateAppointmentToComfirmed = async (id: number) => {
  return await prisma.appointment.update({
    where: {
      id,
    },
    data: {
      status: "confirmed",
    },
  });
};

export const getAllVisits = async (query: any) => {
  if (query.patientId) {
    query.patientId = parseInt(query.patientId, 10);
  }

  const apiFeatures = new ApiFeatures(prisma.visit, query);

  // Apply the filter for visits
  await apiFeatures
    .filter()
    .sort()
    .limitedFields()
    .search("visit")
    .paginateWithCount();

  // Use the correct query to get the result and pagination data
  const { result, pagination } = await apiFeatures.exec("visit");
  return {
    result,
    pagination,
  };
};

export const getVisitById = async (id: number) => {
  return await prisma.visit.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          userName: true,
        },
      },
    },
  });
};

export const getVisitDetails = async (id: number) => {
  return await prisma.visitDetail.findMany({
    where: { visitId: id },
    select: {
      id: true,
      price: true,
      patient: {
        select: {
          id: true,
          name: true,
        },
      },
      schedule: {
        select: {
          id: true,
          price: true,
          service: {
            select: {
              id: true,
              title: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      date: {
        select: {
          id: true,
          fromTime: true,
          toTime: true,
        },
      },
    },
  });
};

export const getVisitInvoice = async (visitId: number) => {
  return await prisma.visitInvoice.findFirst({
    where: { visitId },
    include: { invoice: true },
  });
};

export const appendVisitDetails = async (
  visitDetailsWithPrices: any,
  visit: any,
  req: any,
  visitInvoice: any,
  totalVisitPrice: any,
  visitId: number
) => {
  return await prisma.$transaction(async (prisma) => {
    const createdVisitDetails = await Promise.all(
      visitDetailsWithPrices.map((detail: any) =>
        prisma.visitDetail.create({
          data: {
            visitId: visit.id,
            patientId: detail.patientId,
            price: detail.price,
            scheduleId: detail.scheduleId,
            dateId: detail.dateId,
            createdBy: req.user?.id || 0,
          },
        })
      )
    );

    // Create InvoiceDetails for each VisitDetail
    await Promise.all(
      createdVisitDetails.map((visitDetail, index) =>
        prisma.invoiceDetail.create({
          data: {
            description: `Charge for patient ${visit.rf}`, // Customize description if necessary
            amount: visitDetailsWithPrices[index].price,
            invoiceId: visitInvoice.invoiceId,
            visitDetailsId: visitDetail.id,
            createdBy: req.user?.id || 0,
          },
        })
      )
    );

    // Use Decimal to ensure precision in financial calculations
    const roundedTotalVisitPrice = new Decimal(totalVisitPrice).toFixed(2);

    // Update the visit's total cost
    await prisma.visit.update({
      where: { id: visitId },
      data: { total: visit.total.add(new Decimal(roundedTotalVisitPrice)) },
    });

    // Update the invoice's total cost
    await prisma.invoice.update({
      where: { id: visitInvoice.invoiceId },
      data: {
        total: visitInvoice.invoice.total.add(
          new Decimal(roundedTotalVisitPrice)
        ),
      },
    });

    return { createdVisitDetails, visitInvoice };
  });
};

export const getVisitDetailsWithInclude = async (visitDetailId: number) => {
  return await prisma.visitDetail.findUnique({
    where: { id: visitDetailId },
    include: { invoiceDetail: true }, // Include related invoice details
  });
};

export const removeVisitDetails = async (
  visitDetail: any,
  visitDetailId: number,
  visit: any,
  visitId: number,
  visitInvoice: any
) => {
  return await prisma.$transaction(async (prisma) => {
    await prisma.invoiceDetail.deleteMany({
      where: { visitDetailsId: visitDetail.id },
    });

    await prisma.visitDetail.delete({
      where: { id: visitDetailId },
    });

    const totalVisitPrice =
      visit.total.toNumber() - parseFloat(visitDetail.price.toString());
    const updatedVisitTotal = new Decimal(totalVisitPrice);

    await prisma.visit.update({
      where: { id: visitId },
      data: { total: updatedVisitTotal },
    });

    const totalInvoicePrice = visitInvoice?.invoice.total.toNumber() || 0;
    const updatedInvoiceTotal = new Decimal(totalInvoicePrice).sub(
      new Decimal(visitDetail.price.toString())
    );

    await prisma.invoice.update({
      where: { id: visitInvoice.invoiceId },
      data: { total: updatedInvoiceTotal },
    });
  });
};

export const getVisitIncludeInvoiceDetails = async (id: number) => {
  return await prisma.visit.findUnique({
    where: { id },
    include: {
      details: true,
      VisitInvoice: {
        include: {
          invoice: {
            include: { details: true },
          },
        },
      },
    },
  });
};

export const deleteVisitAndDeleteAllRelatedData = async (
  id: number,
  visit: any
) => {
  await prisma.$transaction(async (prisma) => {
    for (const VisitInvoice of visit.VisitInvoice) {
      const invoiceId = VisitInvoice.invoiceId;
      await prisma.invoiceDetail.deleteMany({
        where: { invoiceId },
      });

      await prisma.visitDetail.deleteMany({
        where: { visitId: id },
      });

      await prisma.visitInvoice.deleteMany({
        where: { visitId: id },
      });

      await prisma.invoice.delete({
        where: { id: invoiceId },
      });

      await prisma.visit.delete({
        where: { id },
      });
    }
  });
};

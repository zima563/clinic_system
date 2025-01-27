import pdfCreator from "pdf-creator-node";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../../prismaClient";
import ApiFeatures from "../../utils/ApiFeatures";
import ApiError from "../../utils/ApiError";

export const createInvoice = async (total: any, createdBy: number) => {
  return prisma.invoice.create({
    data: {
      total: total,
      ex: false,
      createdBy,
    },
  });
};

export const createInvoiceDetails = async (
  id: number,
  body: any,
  createdBy: number
) => {
  return await prisma.invoiceDetail.create({
    data: {
      invoiceId: id,
      createdBy,
      description: body.description,
      amount: body.amount,
    },
    include: {
      invoice: true,
    },
  });
};

export const listInvoice = async (query: any) => {
  const apiFeatures = new ApiFeatures(prisma.invoice, query);

  // Apply filtering, sorting, and pagination
  await apiFeatures.filter().sort().paginateWithCount();

  const { result, pagination } = await apiFeatures.exec("invoice");

  // Calculate the total sum of all `total` values for the filtered results
  const totalSum = await prisma.invoice.aggregate({
    _sum: {
      total: true,
    },
    where: apiFeatures.query.where, // Use the same filtering logic
  });

  return { result, pagination, totalSum };
};

export const getInvoiceDetails = async (id: number) => {
  return await prisma.invoiceDetail.findUnique({
    where: { id },
  });
};

export const updateInvoice = async (
  id: number,
  body: any,
  invoiceDetail: any
) => {
  if (body.amount) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceDetail.invoiceId },
    });

    if (
      !(invoice?.total instanceof Decimal) ||
      !(invoiceDetail.amount instanceof Decimal)
    ) {
      throw new ApiError("Invalid data for amount calculation");
    }

    // Convert values to Decimal if necessary
    const invoiceTotal = new Decimal(invoice?.total || 0);
    const invoiceDetailAmount = new Decimal(invoiceDetail.amount || 0);
    const bodyAmount = new Decimal(body.amount || 0);
    const finalTotal = invoiceTotal.minus(invoiceDetailAmount).plus(bodyAmount);

    await prisma.invoice.update({
      where: { id: invoiceDetail.invoiceId },
      data: { total: finalTotal },
    });
  }

  await prisma.invoiceDetail.update({
    where: { id },
    data: body,
  });
};

export const summeryInvoice = async (date: string, month: string) => {
  if (!date && !month) {
    throw new ApiError(
      "You must provide either a specific date or a month in the format YYYY-MM."
    );
  }

  let startDate: Date = new Date();
  let endDate: Date = new Date();

  if (date) {
    // For specific day
    startDate = new Date(date);
    endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // End of the day
  } else if (month) {
    // For specific month
    startDate = new Date(`${month}-01`);
    endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // End of the month
  }

  const [exTrueTotal, exFalseTotal, invoices] = await Promise.all([
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: {
        ex: true,
        createdAt: {
          gte: startDate.toISOString(),
          lt: endDate.toISOString(),
        },
      },
    }),
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: {
        ex: false,
        createdAt: {
          gte: startDate.toISOString(),
          lt: endDate.toISOString(),
        },
      },
    }),
    prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate.toISOString(),
          lt: endDate.toISOString(),
        },
      },
      include: {
        details: true, // Include related invoice details
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const totalExTrue = exTrueTotal._sum.total
    ? exTrueTotal._sum.total.toNumber()
    : 0;
  const totalExFalse = exFalseTotal._sum.total
    ? exFalseTotal._sum.total.toNumber()
    : 0;
  const profit = totalExTrue - totalExFalse;
  return {
    totalExTrue,
    totalExFalse,
    invoices,
    profit,
  };
};

export const pdf_summary = async (date: string, month: string, res: any) => {
  if (!date && !month) {
    throw new ApiError(
      "You must provide either a specific date or a month in the format YYYY-MM."
    );
  }

  let startDate: Date = new Date();
  let endDate: Date = new Date();

  if (date) {
    startDate = new Date(date);
    endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
  } else if (month) {
    startDate = new Date(`${month}-01`);
    endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
  }

  const [exTrueTotal, exFalseTotal, invoices] = await Promise.all([
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: {
        ex: true,
        createdAt: {
          gte: startDate.toISOString(),
          lt: endDate.toISOString(),
        },
      },
    }),
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: {
        ex: false,
        createdAt: {
          gte: startDate.toISOString(),
          lt: endDate.toISOString(),
        },
      },
    }),
    prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate.toISOString(),
          lt: endDate.toISOString(),
        },
      },
      include: {
        details: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const totalExTrue = exTrueTotal._sum.total
    ? exTrueTotal._sum.total.toNumber()
    : 0;
  const totalExFalse = exFalseTotal._sum.total
    ? exFalseTotal._sum.total.toNumber()
    : 0;
  const profit = totalExTrue - totalExFalse;

  // Prepare the HTML content for the PDF
  const html = `
      <html>
        <head>
          <style>
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            table, th, td { border: 1px solid black; }
            th, td { padding: 8px; text-align: left; }
            h2 { text-align: center; }
            .success { color: green; font-weight: bold; }
            .danger { color: red; font-weight: bold; }
            .total-row { font-weight: bold; text-align: right; background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">Invoice Summarized Report</h1>
          <p>Report Date: ${date || month || "N/A"}</p>
         <p>Total Income (Ex True): <span class="success">${
           totalExTrue || 0
         }</span></p>
          <p>Total Expense (Ex False): <span class="danger">${
            totalExFalse || 0
          }</span></p>
          <p>Profit: ${
            profit >= 0
              ? `<span class="success">${profit}</span>`
              : `<span class="danger">(${Math.abs(profit)})</span>`
          }</p>
          <p>Total Invoices: ${invoices.length || 0}</p>
          
          <h2>Invoice Details:</h2>
          ${invoices
            .map(
              (invoice) => `
              <h3>Invoice ID: ${invoice.id}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.details
                    .map(
                      (detail) => `
                      <tr>
                        <td>${
                          new Date(invoice.createdAt.day)
                            .toISOString()
                            .split("T")[0]
                        }</td>
                        <td>${detail.description}</td>
                        <td>${detail.amount}</td>
                      </tr>
                    `
                    )
                    .join("")}
                    <tr class="total-row">
                    <td colspan="2">Total</td>
            ${
              invoice.ex
                ? `<td class="success" >${invoice.total}</td>`
                : `<td  class="danger">${invoice.total}</td>`
            }
                  </tr>
                </tbody>
              </table>
            `
            )
            .join("")}
        </body>
      </html>
    `;

  // Define PDF options
  const options = {
    format: "A4",
    orientation: "portrait",
    border: "10mm",
  };

  // Define the PDF document
  const document = {
    html,
    data: {},
    type: "buffer", // Add any additional data if needed
  };

  const result = await pdfCreator.create(document, options);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=invoice_report.pdf"
  );
  return result;
};

export const showInvoiceDetails = async (id: number) => {
  return prisma.invoice.findUnique({
    where: {
      id,
    },
    include: {
      creator: {
        select: {
          userName: true,
        },
      },
      details: {
        select: {
          description: true,
          amount: true,
          visitDetail: {
            select: {
              patient: {
                select: {
                  name: true,
                },
              },
              schedule: {
                select: {
                  doctor: {
                    select: {
                      name: true,
                    },
                  },
                  service: {
                    select: {
                      title: true,
                    },
                  },
                },
              },
              date: {
                select: {
                  day: true,
                  fromTime: true,
                  toTime: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

export const listInvoiceDetails = async (id: number) => {
  return prisma.invoiceDetail.findMany({
    where: { invoiceId: id },
  });
};

export const getInvoiceWithDetails = async (id: number) => {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      details: true,
    },
  });
};

export const appendInvoiceDetail = async (
  id: number,
  invoice: any,
  body: any,
  req: any
) => {
  const invoiceTotal = new Decimal(invoice?.total || 0);
  const bodyAmount = new Decimal(body.amount || 0);
  const finalTotal = invoiceTotal.plus(bodyAmount);
  await prisma.invoice.update({
    where: { id },
    data: { total: finalTotal },
  });

  await prisma.invoiceDetail.create({
    data: {
      invoiceId: id,
      createdBy: req.user.id,
      ...body,
    },
    include: {
      invoice: true,
    },
  });
};

export const removeInvoiceDetail = async (
  id: number,
  invoice: any,
  invoiceDetail: any
) => {
  const invoiceTotal = new Decimal(invoice?.total || 0);
  const invoiceDetailAmount = new Decimal(invoiceDetail.amount || 0);
  const finalTotal = invoiceTotal.minus(invoiceDetailAmount);
  await prisma.invoice.update({
    where: { id: invoiceDetail.invoiceId },
    data: { total: finalTotal },
  });
  await prisma.invoiceDetail.delete({
    where: { id },
  });
};

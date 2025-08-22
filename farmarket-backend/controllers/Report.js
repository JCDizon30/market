const Report = require('../models/Report');

// FORMAT REPORT
const formatReport = (report) => ({
  id: report._id,
  reporter: {
    id: report.reporterID._id,
    firstName: report.reporterID.firstName,
    lastName: report.reporterID.lastName
  },
  reported: {
    id: report.reportedID._id,
    firstName: report.reportedID.firstName,
    lastName: report.reportedID.lastName
  },
  order: {
    id: report.orderID._id,
    totalPrice: report.orderID.totalPrice,
    status: report.orderID.status
  },
  reason: report.reason,
  status: report.status,
  createdOn: report.createdOn
});

// CREATE REPORT
module.exports.createReport = async (req, res) => {
  try {
    const { reportedID, orderID, reason } = req.body;
    if (!reportedID || !orderID || !reason) {
      return res.status(400).send({ error: "ReportedID, OrderID, and Reason are required" });
    }

    const newReport = new Report({
      reporterID: req.user._id,
      reportedID,
      orderID,
      reason
    });

    const savedReport = await newReport.save();
    await savedReport
      .populate('reporterID', 'firstName lastName')
      .populate('reportedID', 'firstName lastName')
      .populate('orderID', 'totalPrice status');

    return res.status(201).send(formatReport(savedReport));
  } catch (err) {
    return res.status(500).send({ error: "Something went wrong" });
  }
};

// GET ALL REPORTS (Admin)
module.exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterID', 'firstName lastName')
      .populate('reportedID', 'firstName lastName')
      .populate('orderID', 'totalPrice status');

    if (reports.length === 0) return res.status(404).send({ error: "No reports found" });

    return res.status(200).send(reports.map(formatReport));
  } catch {
    return res.status(500).send({ error: "Something went wrong" });
  }
};

// UPDATE REPORT STATUS (Admin)
module.exports.updateReportStatus = async (req, res) => {
  try {
    const { reportID } = req.params;
    const { status } = req.body;
    const report = await Report.findById(reportID);
    if (!report) return res.status(404).send({ error: "Report not found" });

    report.status = status || report.status;
    await report.save();
    await report.populate('reporterID', 'firstName lastName')
                .populate('reportedID', 'firstName lastName')
                .populate('orderID', 'totalPrice status');

    return res.status(200).send(formatReport(report));
  } catch {
    return res.status(500).send({ error: "Something went wrong" });
  }
};

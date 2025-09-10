const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API Hóa đơn điện FPT đang chạy!");
});

// API check hóa đơn
app.get("/check/:contractNumber", async (req, res) => {
  const contractNumber = req.params.contractNumber;

  if (!contractNumber) {
    return res.status(400).json({ error: "Thiếu contractNumber" });
  }

  const url =
    "https://papi.fptshop.com.vn/gw/v1/public/bff-before-order/pis-online/paybill/query-partner";

  const payload = {
    providerCode: "Payoo",
    contractNumber: contractNumber.toString(),
    sku: "00906815",
    shopAddress: "string",
    shopCode: "string",
    employeeCode: "string"
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "order-channel": "1",
        origin: "https://fptshop.com.vn",
        "User-Agent": "Mozilla/5.0"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data || data.status !== 200) {
      return res.json({
        status: "error",
        message: data && data.message ? data.message : "API lỗi"
      });
    }

    const soTien = data.data.totalContractAmount || 0;
    const daTra = data.data.totalPaid || 0;
    const trangThai = daTra >= soTien ? "ĐÃ THANH TOÁN" : "CÒN NỢ";

    res.json({ contractNumber, trangThai, soTien, daTra });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});

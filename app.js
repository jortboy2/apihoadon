import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/check-bill", async (req, res) => {
  const { contractNumber } = req.body;
  if (!contractNumber) {
    return res.status(400).json({ status: "error", message: "Thiếu contractNumber" });
  }

  const url = "https://papi.fptshop.com.vn/gw/v1/public/bff-before-order/pis-online/paybill/query-partner";
  const payload = {
    providerCode: "Payoo",
    contractNumber: contractNumber.toString(),
    sku: "00906815",
    shopAddress: "string",
    shopCode: "string",
    employeeCode: "string"
  };

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "order-channel": "1",
        "origin": "https://fptshop.com.vn",
        "User-Agent": "Mozilla/5.0 (NodeJS)"
      },
      body: JSON.stringify(payload)
    });

    const text = await resp.text();

    if (text.trim().startsWith("<")) {
      return res.json({ status: "error", message: "Server trả HTML, có thể bị chặn" });
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      return res.json({ status: "error", message: "Parse JSON lỗi: " + e.message });
    }

    if (!result || result.status !== 200) {
      const msg = result?.message || result?.error?.message || "Không xác định";
      return res.json({ status: "error", message: msg });
    }

    const data = result.data;
    if (!data || !data.bills || data.bills.length === 0) {
      return res.json({ status: "ok", contractNumber, state: "Không có hóa đơn" });
    }

    const soTien = data.totalContractAmount || 0;
    const daTra = data.totalPaid || 0;
    const trangThai = (daTra >= soTien) ? "ĐÃ THANH TOÁN" : "CÒN NỢ";

    return res.json({ status: "ok", contractNumber, state: trangThai });
  } catch (err) {
    return res.json({ status: "error", message: err.message });
  }
});

// chạy server ở port 3000
app.listen(3000, () => console.log("Server chạy ở http://localhost:3000"));

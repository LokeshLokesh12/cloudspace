// const mongoose = require("mongoose");
// const dns = require("dns");

// dns.setDefaultResultOrder("ipv4first");

// mongoose
//   .connect(
//     "mongodb+srv://lokesh272203:TestPassword123@cluster0.tkq4dmp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
//   )
//   .then(() => {
//     console.log("✅ Connected successfully");
//     process.exit(0);
//   })
//   .catch((err) => {
//     console.error(err);
//     process.exit(1);
//   });

const dns = require("node:dns").promises;

(async () => {
  try {
    const records = await dns.resolveSrv(
      "_mongodb._tcp.cluster0.tkq4dmp.mongodb.net"
    );
    console.log(records);
  } catch (err) {
    console.error(err);
  }
})();
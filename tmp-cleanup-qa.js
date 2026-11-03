const fs = require("fs");
const env = fs.readFileSync(".env", "utf8");
for (const line of env.split(/\r?\n/)) {
  const i = line.indexOf("=");
  if (i > 0) {
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    )
      v = v.slice(1, -1);
    process.env[line.slice(0, i).trim()] = v;
  }
}

const { MongoClient } = require("mongodb");

(async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("change-together");
  const email = "qa.owner.audit2@example.com";

  const user = await db.collection("user").findOne({ email });
  if (user) {
    for (const col of ["session", "account"]) {
      const r = await db
        .collection(col)
        .deleteMany({ $or: [{ userId: user.id }, { userId: user._id }] });
      console.log(`deleted ${r.deletedCount} from ${col}`);
    }
    const u = await db.collection("user").deleteOne({ _id: user._id });
    console.log(`deleted ${u.deletedCount} from user`);
  } else {
    console.log("no qa user found");
  }

  const joins = await db.collection("event-joins").countDocuments();
  const events = await db.collection("create-event").countDocuments();
  const leftovers = await db
    .collection("create-event")
    .countDocuments({ title: /^QA ownership probe/ });
  console.log({ joins, events, eventLeftovers: leftovers });

  await client.close();
})().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});

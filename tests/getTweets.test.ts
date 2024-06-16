const request = require("supertest");
const app = require("../src/app");

// beforeAll(async () => {
//   await sequelize.test.sync();
// });

describe("/getTweets", function () {
  it("GET /getTweets", function (done) {
    request(app)
      .get("/getTweets")
      .set("Accept", "application/json")
      .expect((res: any) => {
        console.log(res.data);
      })
      .expect(200, done);
  });
});

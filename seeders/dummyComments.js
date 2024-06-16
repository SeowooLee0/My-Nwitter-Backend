"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const comments = [];
    for (let i = 0; i < 10000; i++) {
      comments.push({
        email: "example@naver.com",
        tweet_id: 10033,
        comment: "dummyComments",
        write_date: Sequelize.literal(`now()`),
      });
    }

    // 데이터베이스에 더미 데이터 삽입
    await queryInterface.bulkInsert("Comments", comments, {});

    console.log("더미 데이터 생성 완료");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Comments", null, {});
  },
};

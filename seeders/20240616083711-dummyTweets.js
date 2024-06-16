"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tweets = [];
    for (let i = 0; i < 10000; i++) {
      tweets.push({
        user_id: 4, // 1~100 사이의 사용자 ID
        email: "example@naver.com",
        content: "dummy data",
        tag: JSON.stringify(["#dummyTest"]),
        write_date: Sequelize.literal(`now()`),
        upload_file: null,
        reply_tweet_id: null,
      });
    }

    // 데이터베이스에 더미 데이터 삽입
    await queryInterface.bulkInsert("Tweets", tweets, {});

    console.log("더미 데이터 생성 완료");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Tweets", null, {});
  },
};

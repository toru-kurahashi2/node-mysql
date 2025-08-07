const knex = require("../db/knex");

const TABLE_NAME = "tasks";

async function findByUserId(userId) {
  return await knex(TABLE_NAME)
    .where("user_id", userId)
    .orderBy("id", "desc");
}

async function create(task) {
  return await knex(TABLE_NAME).insert(task);
}

async function updateIsDone(taskId, isDone) {
  return await knex(TABLE_NAME)
    .where("id", taskId)
    .update({ is_done: isDone });
}

module.exports = {
  findByUserId,
  create,
  updateIsDone,
};
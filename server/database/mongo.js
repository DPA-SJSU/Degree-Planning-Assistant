/* eslint-disable consistent-return */
/* eslint-disable no-return-assign */
/* eslint-disable no-underscore-dangle */

const MODELS = require('./models');

module.exports = {
  models: MODELS,

  get(collection, query, callback) {
    collection.find(query).exec((err, results) => {
      if (err) return callback(err);
      callback(err, results);
    });
  },

  count(collection, query, callback) {
    collection.count(query).exec((err, c) => {
      if (err) return callback(err);
      callback(err, c);
    });
  },

  getOne(collection, query, callback) {
    collection.findOne(query).exec((err, results) => {
      if (err) return callback(err);
      callback(err, results);
    });
  },

  getWithPagination(collection, query, page, limit, callback) {
    collection
      .find(query)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec((err, results) => {
        if (err) return callback(err);
        callback(err, results);
      });
  },

  getWithLimitThenSort(collection, query, limitNum, sortObj, callback) {
    collection
      .find(query)
      .limit(limitNum)
      .sort(sortObj)
      .exec((err, results) => {
        if (err) return callback(err);
        callback(err, results);
      });
  },

  getLastOne(collection, query, callback) {
    collection
      .findOne(query)
      .sort({ createdAt: -1 })
      .exec((err, results) => {
        if (err) return callback(err);
        callback(err, results);
      });
  },

  create(collection, obj, callback) {
    const item = new collection(obj);
    item.save((err, createdData) => {
      if (err) return callback(err);
      callback(err, createdData);
    });
  },

  update(collection, query, obj, callback) {
    const currentObj = obj;
    collection.findOne(query, (err, result) => {
      const currentResult = result;
      if (err) return callback(err);

      if (!result) return callback();

      // Delete unexpected key
      delete currentObj.created_at;
      delete currentObj.__v;

      obj.forEach(key => (currentResult[key] = obj[key]));

      return currentResult.save((saveErr, savedResult) => {
        if (err) return callback(saveErr);
        return callback(err, savedResult);
      });
    });
  },

  remove(collection, query, callback) {
    collection.remove(query, (err, result) => {
      if (err) return callback(err);
      callback(err, result);
    });
  },

  createOrUpdate(collection, fieldKey, data, callback) {
    const condition = {};
    condition[fieldKey] = data[fieldKey];
    collection.findOne(condition, (err, result) => {
      if (err) return callback(err);
      if (!result) {
        const newItem = new collection(data);
        newItem.save((saveErr, createdItem) => {
          if (err) return callback(saveErr);
          callback(null, createdItem);
        });
      } else {
        collection.findByIdAndUpdate(
          result._id,
          data,
          (findUpadateErr, updatedItem) => {
            if (err) return callback(findUpadateErr);
            return callback(null, updatedItem);
          }
        );
      }
    });
  },
};

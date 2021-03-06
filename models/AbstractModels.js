export const mongoFindOne = async (
  col,
  findCondition,
  selectCondition = {},
) => {
  const result = await col
    .findOne(findCondition)
    .select(selectCondition)
    .lean()
    .exec();
  // console.log("===== from the mongo find one "+JSON.stringify(result));
  return result;
};

export const mongoFindOneWithOutLean = async (
  col,
  findCondition,
  selectCondition = {},
) => {
  const result = await col
    .findOne(findCondition)
    .select(selectCondition)
    .exec();
  return result;
};

export const mongoFindWithSort = async (
  col,
  findCondition,
  selectCondition = {},
  limit = 0,
  sortCondition = { _id: -1 },
) => {
  const result = await col
    .find(findCondition)
    .select(selectCondition)
    .sort(sortCondition)
    .limit(limit)
    .lean()
    .exec();
  return result;
};

export const mongoFindMany = async (
  col,
  findCondition,
  selectCondition = {},
  limit = 0,
) => {
  const result = await col
    .find(findCondition)
    .select(selectCondition)
    .limit(limit)
    .lean()
    .exec();
  return result;
};

export const mongoFindCursor = async (
  col,
  findCondition,
  selectCondition = {},
  limit = 0,
) => {
  const cursor = await col
    .find(findCondition)
    .select(selectCondition)
    .limit(limit)
    .lean()
    .cursor();
  return cursor;
};

export const mongoCount = async (col, findCondition) => {
  const count = await col.count(findCondition);
  return count;
};

export const mongoUpdateOne = async (col, findCondition, updateCondition) => {
  await col.updateOne(findCondition, updateCondition);
};

export const mongoUpsertOne = async (col, findCondition, updateCondition) => {
  await col.updateOne(findCondition, updateCondition, { upsert: true });
};

export const mongoUpdateMany = async (col, findCondition, updateCondition) => {
  await col.updateOne(findCondition, updateCondition, { multi: true });
};

export const mongoAggregate = async (col, aggregateCondition) => {
  const result = col.aggregate(aggregateCondition);
  return result;
};

export const mongoDeleteOne = async (col, findCondition) => {
  await col.deleteOne(findCondition);
};

export const mongoDeleteMany = async (col, findCondition) => {
  await col.deleteMany(findCondition);
};

export const mongoInsertOne = async (col, doc) => {
  const moongooseDoc = col(doc);
  const result = await moongooseDoc.save();
  return result;
};

export const mongoInsertMany = async (col, docs) => {
  await col.insertMany(docs);
};

export const mongoDistinct = async (col, string, findCondition) => {
  const result = await col.distinct(string, findCondition);
  return result;
};

// export const mongoFindOneAndUpdate = async (
//   col,
//   findCondition,
//   updateCondition,
//   returnCondition,
// ) => {
//   console.log("+++++ the col is"+col);
//   console.log("+++++ the find cond  is"+JSON.stringify(findCondition));
//   console.log("+++++ the update cond  is"+JSON.stringify(updateCondition));
//   const result = await col.findOneAndUpdate(
//     findCondition,
//     updateCondition,
//     returnCondition,
//   );
//   console.log("+++++++++++++++++++FIND AND UPDATE"+ result);
//   return result;
  
// };
export const mongoFindOneAndUpdate = async (
  col,
  selectCondition,
  updateCondition,
  returnCondition
) => {
  return new Promise(async (resolve, reject) => {
    try {
     // console.log("TEsting ERROR -----------------------------",col,selectCondition,updateCondition);
      col.findOneAndUpdate(
        selectCondition,
        updateCondition,
        returnCondition,
        function (error, res) {
          if (error) {
            reject(new Error(error));
          } else {
            resolve(res);
          }
        }
      );
    } catch (error) {
      reject(new Error(error));
    }
  });
};

export const mongoFindOneAndRemove = async (col, findCondition) => {
  const result = await col.findOneAndRemove(findCondition);
  return result;
};

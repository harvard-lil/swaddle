module.exports = function(){
  return {
    array: () => { throw "multer is not enabled in this build" },
    fields: () => { throw "multer is not enabled in this build" },
  }
}
module.exports.memoryStorage = () => "multer is not enabled in this build";

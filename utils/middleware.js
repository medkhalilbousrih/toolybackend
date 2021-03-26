const errorHandler = (err, req, res, next) => {
  console.log(err.message);
  res.status(500).end(err.message);
};
const unknownEndpoint = (req, res) => {
  res.status(404).end();
};

module.exports = { errorHandler, unknownEndpoint };

const ExpressError = require('../utility/ExpressError');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        return next(new ExpressError(400, msg));
    }
    next();
};

module.exports = validate; 
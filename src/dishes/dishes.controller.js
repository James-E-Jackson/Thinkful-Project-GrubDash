const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function dishExists(req, res, next){
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if(foundDish){
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Order id not found: ${dishId}`,
    });
}

function create(req, res, next){
    const newDish = { 
        id: nextId(),
        ...req.body.data,
    }
    dishes.push(newDish);
    res.status(201).json({data: newDish})
}

function isValid(req, res, next){
    const { data: { 
        name,
        description,
        image_url,
        price,
        } = {}} = req.body;

        if(!name || name===""){
            next({
                status: 400,
                message: `Dish must include a name`,
            })
        }
        if(!description || description===""){
            next({
                status: 400,
                message: `Dish must include a description`,
            })
        }
        if(!image_url || image_url===""){
            next({
                status: 400,
                message: `Dish must include an image_url`,
            })
        }
        if(!price || price===0 || price < 0 || (typeof price) != "number"){
            next({
                status: 400,
                message: `Dish must include a price`,
            })
        }
        next();
}

function isMatch(req, res, next){
    if( req.body.data.id != req.params.dishId && req.body.data.id){
        return next({
            status: 400,
            message: `id${req.body.data.id} must match ${req.params.dishId}`
        })
    }
    next();
}

function list(req, res, next){
    res.json({data: dishes})
}

function read(req, res, next){
    res.json({data: res.locals.dish})
}
function update(req, res, next){
    const updatedDish = req.body.data;
    if(!updatedDish.id) updatedDish.id = req.params.dishId;
    const index = dishes.findIndex((dish) => dish.id === updatedDish.id);
    dishes[index] = updatedDish;
    res.json({data: updatedDish})
}

module.exports = {
    create: [isValid, create],
    list,
    read: [dishExists, read],
    update: [dishExists, isValid, isMatch, update],
    dishExists,
  };
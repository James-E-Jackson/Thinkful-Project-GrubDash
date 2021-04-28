const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderExists(req, res, next) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);
    if(foundOrder){
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order id not found: ${orderId}`,
    });
}

function create(req,res,next) {
    const newOrder = {
        id: nextId(),
        ...req.body.data,
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder})
    
}

function isValid(req, res, next) {
    const { data: { 
        deliverTo,
        mobileNumber,
        dishes,
        } = {}} = req.body;

    if(!deliverTo || deliverTo === ""){
        next({
            status: 400,
            message: `Order must include a deliverTo`,
        })
    }
    if(!mobileNumber || mobileNumber === ""){
        next({
            status: 400,
            message: `Order must include a mobileNumber`
        })
    }
    if(!dishes){
        next({
            status: 400,
            message: `Order must include a dish`
        })
    }
    if(!Array.isArray(dishes) || dishes.length === 0){
        next({
            status: 400,
            message: `Order must include at least one dish`
        })
    }
    for(let i=0; i<dishes.length; i++){
        const dishQuantity = dishes[i].quantity;
        if(!dishQuantity || dishQuantity < 0 || !Number.isInteger(dishQuantity)){
            next({
                status: 400,
                message: `Dish ${i} must have a quantity that is an integer greater than 0`
            })
        }
    }
    return next();
}

function isMatch(req, res, next){
    if( req.body.data.id != req.params.orderId && req.body.data.id){
        return next({
            status: 400,
            message: `id${req.body.data.id} must match ${req.params.orderId}`
        })
    }
    next();
}

function statusIsValid(req, res, next){
    const { data: { status } = {} } = req.body;
    if(!status || status!=="pending"){
        return next({
            status: 400,
            message: "status must exist and not be delivered"
        })
    }
    next();
}

function read(req, res, next){
    res.json({data: res.locals.order})
}

function list(req, res) {
    res.json({ data: orders})
}

function update(req,res){
    const updatedOrder = req.body.data;
    if(!updatedOrder.id) updatedOrder.id = req.params.orderId;
    const index = orders.findIndex((order) => order.id === updatedOrder.id);
    orders[index] = updatedOrder;
    res.json({data: updatedOrder})
}

function destroy(req, res, next) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
    if(orders[index].status !== "pending") {
        next({
            status: 400,
            message: "status must be pending"
        })
    }
    if(index > -1){
        orders.splice(index, 1);
    }
    res.sendStatus(204);
}

module.exports = {
    create: [isValid, create],
    list,
    read: [orderExists, read],
    update: [orderExists, isValid, isMatch, statusIsValid, update],
    delete: [orderExists, destroy],
    orderExists,
}
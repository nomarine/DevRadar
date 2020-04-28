const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnection, sendMessage } = require('../websocket')

module.exports = {
    async destroy(request, response) {
        const { github_username } =  request.body;

        dev = await Dev.findOneAndDelete(github_username)

        console.log(dev)

        return response.json(dev);
    },

    async index(request, response) {
        const devs = await Dev.find();
        
        return response.json(devs);
    },


    async store (request, response) {
    const { github_username, techs, latitude, longitude } =  request.body;

    let dev = await Dev.findOne( { github_username } );

    if (!dev) {
        const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);

    const { name = login, avatar_url, bio } = apiResponse.data;

    const techsArray = parseStringAsArray(techs);

    const location = {
        type: 'Point',
        coordinates: [longitude, latitude],
    };

    dev = await Dev.create({
        name,
        github_username,
        bio,
        avatar_url,
        techs: techsArray,
        location,
    })

    const sendSocketMessageTo = findConnection(
        { latitude, longitude },
        techsArray,
    )

    sendMessage(sendSocketMessageTo, 'newDev', dev);
     
    }

    return response.json(dev);
    }
};
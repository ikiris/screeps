let behaviorFeed = require('behavior-feed');

module.exports = {
    run: function(creep) {
        let source = Game.getObjectById(creep.memory.sourceid);
        let container = undefined;
        if (creep.memory.containerid != undefined) {
            container = game.getObjectById(containerid);
        }
        if(container == undefined && creep.memory.drop == undefined && creep.carry.energy == creep.carryCapacity) {
            creep.addOverride('feed');
            behaviorFeed.run(creep);
            return;
        }
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            if (container != undefined) {
                creep.TravelTo(container)
                return;
            } else {
                creep.TravelTo(source);
                return;
            }
        }
        if (creep.transfer(container,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.TravelTo(container);
        }
    }
};

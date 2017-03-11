let behaviorFeed = require('behavior-feed');

module.exports = {
    run: function(creep) {
        let source = Game.getObjectById(creep.memory.sourceid);
        let container = undefined;
        if (creep.memory.containerid != undefined) {
            container = Game.getObjectById(creep.memory.containerid);
        }
        if (creep.memory.container != undefined && creep.transfer(container,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.TravelTo(container);
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
        if(container == undefined && creep.memory.drop == undefined && creep.carryCapacity != 0 && creep.carry.energy == creep.carryCapacity) {
            creep.addOverride('feed');
            behaviorFeed.run(creep);
            return;
        }
    }
};

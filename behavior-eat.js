let behaviorFeed = require('behavior-feed');

module.exports = {
    run: function(creep) {
        let container = Game.getObjectById(creep.memory.sourceid);
        if (container == undefined || creep.carry.energy == creep.carryCapacity) {
            delete creep.memory.sourceid;
            creep.rmOverride("eat");
            return;
        }
        res = creep.pickup(container);
        if (res == ERR_NOT_IN_RANGE) {
            creep.TravelTo(container);
            return;
        }

        res = creep.withdraw(container,RESOURCE_ENERGY);
        if (res == ERR_NOT_IN_RANGE) {
            creep.TravelTo(container);
            return;
        } else if (res == ERR_NOT_ENOUGH_ENERGY) {
            creep.rmOverride('eat');
            return;
        }
    }
};

let behaviorEat = require('behavior-eat');

module.exports = {
    run: function(creep) {
        if (creep.memory.findwait > 0) {
            creep.memory.findwait--;
        }
        if (creep.carry.energy == creep.carryCapacity) {
            creep.rmOverride("find");
            delete creep.memory.sourceid;
            return;
        }
        let target = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY);
        if (target != undefined) {
            creep.memory.sourceid = target.id;
            creep.addOverride('eat');
            behaviorEat.run(creep);
            return;
        }
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) &&
            s.store[RESOURCE_ENERGY] > 0
        });
        if (target == undefined) {
            creep.memory.findwait = 5;
            return;
        }
        creep.memory.sourceid = target.id
        creep.addOverride('eat');
        behaviorEat.run(creep);
        return;
    }
};

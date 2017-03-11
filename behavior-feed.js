module.exports = {
    run: function(creep) {
        if(creep.carry.energy == 0) {
            creep.rmOverride('feed');
            return;
        }
        let target = undefined;
        if (creep.memory.targetid != undefined) {
            target = Game.getObjectById(creep.memory.targetid);
        }
        if (creep.transfer(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.TravelTo(target);
            return;
        }
    }
};

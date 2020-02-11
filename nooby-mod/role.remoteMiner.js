module.exports = {
    // a function to run the logic for this role
    run: function (creep) {
        // get source
        //console.log(creep.memory.firsttick);
        if (typeof creep.memory.firsttick === "undefined") {
            creep.memory.firsttick = Game.time;
        }
        let source = Game.getObjectById(creep.memory.sourceId);
        // find container next to source
        let container = source.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_CONTAINER
        })[0];

        if (typeof container === undefined) {
            let h = creep.harvest(source)
            if(h == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            } else if (h == OK && typeof creep.memory.firstmine === "undefined") {
                creep.memory.firstmine = Game.time;
            }
            return;
        }
        // if creep is on top of the container
        if (creep.pos.isEqualTo(container.pos)) {
            if (typeof creep.memory.firstmine === "undefined") {
                creep.memory.firstmine = Game.time;
            }
            // harvest source
            creep.harvest(source);
        }
        // if creep is not on top of the container
        else {
            // move towards it
            creep.moveTo(container);
        }
    }
};

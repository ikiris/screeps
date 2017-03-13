var roleBuilder = require('role.builder');

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function(creep) {
        // if creep is trying to repair something but has no energy left
        if (creep.memory.working == true && creep.carry.energy == 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
            delete creep.memory.targwall;
        }

        // if creep is supposed to repair something
        let target
        if (creep.memory.working == true) {
            // find all walls in the room
            if (creep.memory.targwall == undefined) {
                var walls = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType == STRUCTURE_WALL  && s.hits < s.hitsMax) || (s.structureType == STRUCTURE_RAMPART && s.hits < (creep.room.memory.war == true ? s.hitsMax : 30000))
                });
                let wall = _(walls).reduce(function(min, w) {
                    if (min == undefined) {
                        min = w;
                    }
                    //console.log(w.hits);
                    return min.hits < w.hits ? min : w;
                }, 0);
                //console.log(wall.hits)
                if (wall != undefined) {
                    creep.memory.targwall = wall.id
                    target = wall
                }
            } else target = Game.getObjectById(creep.memory.targwall)

            // if we find a wall that has to be repaired
            if (target != undefined) {
                // try to repair it, if not in range
                if (target.hits == target.hitsMax) {
                    delete creep.memory.targwall;
                    return;
                }
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(target);
                }
            }
            // if we can't fine one
            else {
                // look for construction sites
                roleBuilder.run(creep);
            }
        }
        // if creep is supposed to get energy
        else {
            creep.getEnergy(true, true);
        }
    }
};
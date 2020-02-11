module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function(creep) {
        if (creep.carry.energy < creep.carryCapacity) {
            let pickups = this.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
                filter: r => (r.resourceType == RESOURCE_ENERGY)
            }); //TODO(ikiris):eventually support more types by role
            if (pickups.length > 0) {
                pickup = creep.pos.findClosestByPath(pickups);
                if (creep.pickup(pickup) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(pickup);
                }
                return;
            }
        }
        // if creep is bringing energy to a structure but has no energy left
        if (creep.memory.working == true && creep.carry.energy == 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working == true) {
            if (creep.room.name != creep.memory.home) {
                creep.moveTo(Game.rooms[creep.memory.home]);
                return;
            }
            // find closest spawn, extension or tower which is not full
            var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => (s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION
                             || s.structureType == STRUCTURE_TOWER
                             || s.structureType == STRUCTURE_STORAGE)
                             && s.energy < s.energyCapacity
            });

            // if we found one
            if (structure != undefined) {
                // try to transfer energy, if it is not in range
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(structure);
                }
            }
        } else {
            if (creep.room.name == creep.memory.targetid) {
                let source = Game.getObjectById(creep.memory.sourceid);
                let tpos = source.pos
                let container
                if (!creep.memory.containerid === undefined) {
                    container = Game.getObjectById(creep.memory.containerid);
                    if (containerid == undefined) {
                        delete creep.memory.containerid;
                    } else {
                        tpos = container.pos;
                    }
                } else {
                    container = source.pos.findInRange(FIND_MY_STRUCTURES,1,{filter: (s) => (s.structureType == STRUCTURE_CONTAINER)});
                    if (!container === undefined) {
                        creep.memory.containerid = container.id;
                        tpos = container.pos;
                    }
                }
                if (container === undefined) {
                    creep.moveTo(tpos);
                } else {
                    if (creep.withdraw(container) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(tpos);
                    }
                }
            }
        }
    }
};
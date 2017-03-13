var roleUpgrader = require('role.upgrader');

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function (creep) {
        // if target is defined and creep is not in target room
        if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
            // find exit to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            // move to exit
            creep.moveTo(creep.pos.findClosestByRange(exit));
            // return the function to not do anything else
            return;
        }

        // if creep is trying to complete a constructionSite but has no energy left
        if (creep.memory.working == true && creep.carry.energy == 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to complete a constructionSite
        if (creep.memory.working == true) {
            // find closest constructionSite
            let prioritysites;
            let constructionSite;
            priorityTypeList = [
                [STRUCTURE_EXTENSION, STRUCTURE_CONTAINER],
                [STRUCTURE_WALL, STRUCTURE_RAMPART],
                STRUCTURE_TOWER,
                STRUCTURE_STORAGE
            ];
            for (let st of priorityTypeList) {
                prioritysites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                prioritysites = _(prioritysites).filter(function(s) {
                    return _.includes(st, s.structureType)
                }).valueOf();
                if (prioritysites.length > 0) {
                    break;
                }
            }
            if (prioritysites.length > 0) {
                creep.say("pri");
                constructionSite = creep.pos.findClosestByPath(prioritysites);
            }
            // if one is found
            if (constructionSite == undefined) {
                creep.say("nopri");
                constructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
            }
            // if one is found
            if (constructionSite != undefined) {
                //creep.say(constructionSite.structureType);
                // try to build, if the constructionSite is not in range
                if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                    // move towards the constructionSite
                    creep.moveTo(constructionSite);
                }
            }
            // if no constructionSite is found
            else {
                // go upgrading the controller
                //creep.say("upgrad");
                roleUpgrader.run(creep);
            }
        }
        // if creep is supposed to get energy
        else {
            creep.say("eat");
            creep.getEnergy(true, true);
        }
    }
};
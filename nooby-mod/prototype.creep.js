var roles = {
    harvester: require('role.harvester'),
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
    repairer: require('role.repairer'),
    wallRepairer: require('role.wallRepairer'),
    longDistanceHarvester: require('role.longDistanceHarvester'),
    claimer: require('role.claimer'),
    miner: require('role.miner'),
    lorry: require('role.lorry')
};

Creep.prototype.runRole =
    function () {
        //this.say(this.memory.role);
        roles[this.memory.role].run(this);
    };

/** @function 
    @param {bool} useContainer
    @param {bool} useSource */
Creep.prototype.getEnergy =
    function (useContainer, useSource) {
        /** @type {StructureContainer} */
        if (this.memory.seeke == undefined || this.memory.seeke == 0) {
            this.memory.seeke = 3;
            let pickups = this.pos.findInRange(FIND_DROPPED_ENERGY, 1); //TODO(ikiris):eventually support more types by role
            if (pickups.length > 0) {
                this.pickup(pickups[0]);
                return;
            }
        } else this.memory.seeke--;
        let container;
        // if the Creep should look for containers
        if (useContainer) {
            // find closest container
            container = this.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: s => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) &&
                s.store[RESOURCE_ENERGY] > 10
            });
            if (container.length == 0) {
                container = this.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) &&
                    s.store[RESOURCE_ENERGY] > this.carryCapacity/2
                });
            } else {
                container = this.pos.findClosestByPath(container);
            }
            // if one was found
            if (container != undefined) {
                // try to withdraw energy, if the container is not in range
                res = this.withdraw(container, RESOURCE_ENERGY);
                if (res == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(container);
                }
            }
        }
        // if no container was found and the Creep should look for Sources
        if (container == undefined && useSource) {
            // find closest source
            let sources = Game.rooms[this.room.name].find(FIND_SOURCES, {filter: s => s.energy > 10});
            // iterate over all sources
            let creepsInRoom = this.room.find(FIND_MY_CREEPS);
            sources = _(sources).filter(function(s) {
                return !_.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceId == s.id && c.getActiveBodyparts(WORK) == 5)
                }).valueOf();
            let source = this.pos.findClosestByPath(sources);
            if (this.harvest(source) == ERR_NOT_IN_RANGE) {
                // move towards it
                this.moveTo(source);
            }
        }
    };

module.exports = function() {
    Creep.prototype.addOverride =
        function(behavior) {
            if (this.memory.postoverride != undefined) {
                return;
            }
            this.memory.postoverride = this.memory.behavior;
            this.memory.behavior = behavior;
        };
    Creep.prototype.rmOverride =
        function(behavior) {
            if (this.memory.behavior != behavior && this.memory.postoverride != undefined) {
                return
            }
            this.memory.behavior = this.memory.postoverride;
            delete this.memory.postoverride;
        };
    Creep.prototype.TravelTo =
        function(target) {
        if (this.getActiveBodyparts(WORK) > 0) {
            if (this.carry.energy > 0) {
                // I'm avaliable to do stuff in transit!

                let constructsiteid = this.memory.constructsiteid;
                let constructsite = undefined;
                if (constructsiteid == undefined) {
                    let constructionSites = this.pos.findInRange(FIND_CONSTRUCTION_SITES, 3);
                    if (constructionSites.length > 0) {
                        constructsite = this.pos.findClosestByPath(constructionSites);
                        this.memory.constructsiteid = constructsite.id;
                    }
                }
                if (constructsite != undefined || constructsiteid != undefined) {
                    if (constructsiteid != undefined) {
                        constructsite = Game.getObjectById(constructsiteid);
                    }
                    if(constructsite != undefined) {
                        if (this.build(constructsite) == ERR_NOT_IN_RANGE) {
                            this.moveTo(constructsite);
                        }
                        return;
                    } else {
                        delete this.memory.constructsiteid;
                    }
                }

                let repairsiteid = this.memory.repairsiteid;
                let repairsite = undefined;
                if (repairsiteid == undefined) {
                    let repairSites = this.pos.findInRange(FIND_MY_STRUCTURES, 3, {filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL});
                    if (repairSites.length > 0) {
                        repairsite = this.pos.findClosestByPath(repairSites);
                        this.memory.repairsiteid = repairsite.id;
                    }
                }
                if (repairsite != undefined || repairsiteid != undefined) {
                    if (repairsiteid != undefined) {
                        repairsite = Game.getObjectById(repairsiteid);
                    }
                    if(repairsite != undefined) {
                        if (this.repair(repairsite) == ERR_NOT_IN_RANGE) {
                            this.moveTo(repairsite);
                        }
                        return;
                    } else {
                        delete this.memory.repairsiteid;
                    }
                }
            }
        }
        if (this.carryCapacity > 0 && this.carryCapacity > _.sum(this.carry)) {
            // I can carry more stuff!
            let pickupid = this.memory.pickupid;
            let pickup = undefined;
            if (pickupid == undefined) {
                let pickups = this.pos.findInRange(FIND_DROPPED_ENERGY, 4); //TODO(ikiris):eventually support more types by role
                if (pickups.length > 0) {
                    pickup = this.pos.findClosestByPath(pickups);
                    this.memory.pickupid = pickup.id;
                }
            }
            if (pickup != undefined || pickupid != undefined) {
                if (pickupid != undefined) {
                    pickup = Game.getObjectById(pickupid);
                }
                if(pickup != undefined) {
                    if (this.pickup(pickup) == ERR_NOT_IN_RANGE) {
                        this.moveTo(pickup);
                    }
                    return;
                } else {
                    delete this.memory.pickupid;
                }
            }
        }
        this.moveTo(target);
    };
};
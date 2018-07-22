import {
    Node
} from '@/tree'

export class Rule {
    constructor(id) {
        this.id = id;
        this.type = "null";
    }
	compareTo(other) {
		if(this.type !== other.type) return false;
		switch(this.type) {
			case 'skillpoint':
				return this.node === other.node;
			case 'level':
				return this.level === other.level;
			case 'skillpoint':
				return this.skillpoints === other.skillpoints;
			default:
				return true;
		}
	}
}

export class DependencyRule extends Rule {
    constructor(id, node) {
        super(id);
        this.node = node;
        this.type = "dependency";
    }
	clone() {
		var newRule = new DependencyRule(this.id, this.node);
		return newRule;
	}
}

export class LevelRule extends Rule {
    constructor(id, level) {
        super(id);
        this.level = level;
        this.type = "level";
    }
	clone() {
		var newRule = new LevelRule(this.id, this.level);
		return newRule;
	}
}

export class SkillPointRule extends Rule {
    constructor(id, skillpoints) {
        super(id);
        this.skillpoints = skillpoints;
        this.type = "skillpoint";
    }
	clone() {
		var newRule = new SkillPointRule(this.id, this.skillpoints);
		return newRule;
	}
}

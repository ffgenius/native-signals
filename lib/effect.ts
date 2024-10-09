import { Dependency, DirtyLevels, IEffect, Subscriber } from './system';

export function effect(fn: () => void) {
	const e = new Effect(fn);
	e.run();
	return e;
}

export class Effect implements IEffect, Dependency, Subscriber {
	nextNotify = undefined;

	// Dependency
	subs = undefined;
	subsTail = undefined;
	subVersion = -1;

	// Subscriber
	deps = undefined;
	depsTail = undefined;
	versionOrDirtyLevel = DirtyLevels.Dirty;

	constructor(
		private fn: () => void
	) {
		Dependency.linkSubscriberScope(this);
	}

	notify() {
		if (this.versionOrDirtyLevel === DirtyLevels.MaybeDirty) {
			Subscriber.resolveMaybeDirty(this);
		}
		if (this.versionOrDirtyLevel === DirtyLevels.Dirty) {
			this.run();
		}
	}

	notifyLostSubs(): void {
		Subscriber.clearTrack(this);
	}

	run() {
		const prevScope = Subscriber.startScopeTrack(this);
		const prevSub = Subscriber.startTrack(this);
		this.fn();
		Subscriber.endTrack(this, prevSub);
		Subscriber.endScopeTrack(this, prevScope);
	}
}

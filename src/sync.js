class Event {
    constructor() {
        this.waiters = [];
        this.value = false;
    }
    set() {
        if(!this.value){
            while(this.waiters.length) {
                var waiter = this.waiters.pop();
                if (waiter) {
                    waiter();
                }
            }
        }
    }
    is_set() {
        return this.value;
    }
    async wait () {
        if (this.value) {
            return true;
        }
        await new Promise((resolve) => {
            this.waiters.push(resolve);
        });
        return true;
    }
}
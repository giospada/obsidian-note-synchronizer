//create a singleton
export default class LoggerSync{
    public created_new: string[] = [];
    public modified: string[] = [];
    public deleted: string[] = [];
    public cached:string[] = [];
    public changed_deck: string[] = [];
    public added_decks: string[] = [];
    public errors: string[] = [];
    public malformed: string[] = [];

    reset(){
        this.created_new = [];
        this.modified = [];
        this.deleted = [];
        this.cached = [];
        this.changed_deck = [];
        this.errors = [];
        this.malformed= [];
        this.added_decks = [];
        return this;
    }
    private static instance: LoggerSync;
    private constructor(){
    }
    static getInstance(){
        if(!LoggerSync.instance){
            LoggerSync.instance = new LoggerSync();
        }
        return LoggerSync.instance;
    }


    print(){
        console.log("created_new: ", this.created_new);
        console.log("modified: ", this.modified);
        console.log("deleted: ", this.deleted);
        console.log("cached: ", this.cached);
        console.log("changed_deck: ", this.changed_deck);
        console.log("errors: ", this.errors);
        console.log("malformed: ", this.malformed);
        console.log("added_decks: ", this.added_decks);
    }

}
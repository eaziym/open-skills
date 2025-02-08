class Message {
  constructor(id, room_id, from, to, timestamp) {
    this.id = id;
    this.room_id = room_id;
    this.from = from;
    this.to = to;
    this.timestamp = timestamp;
    this.type = "general";
  }

  getMessageType() {
    return this.type;
  }
}

class TextMessage extends Message {
    constructor(id, room_id, from, to, timestamp, text) {
        super(id, room_id, from, to, timestamp);
        this.text = text;
        this.type = "text";
    }

}

class FileMessage extends Message {
    constructor(id, room_id, from, to, timestamp, file, text="") {
        super(id, room_id, from, to, timestamp);
        this.file = file;
        this.text = text;
        this.type = "file";

        if (!this.file.fileId) {
            this.file.fileId = this.file._id;
        }
    }
}

class ImageMessage extends Message {
    constructor(id, room_id, from, to, timestamp, file, text="") {
        super(id, room_id, from, to, timestamp);
        this.file = file;
        this.text = text;
        this.type = "image";

        if (!this.file.fileId) {
            this.file.fileId = this.file._id;
        }
    }
}
export { TextMessage, FileMessage, ImageMessage };
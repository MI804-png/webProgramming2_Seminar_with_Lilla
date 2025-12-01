// SQLite to MySQL query adapter
class SQLiteAdapter {
    constructor(db) {
        this.db = db;
        this.connected = true;
    }
    
    query(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        
        try {
            // Convert MySQL INSERT/UPDATE/DELETE to SQLite
            const sqlLower = sql.toLowerCase().trim();
            
            if (sqlLower.startsWith('select')) {
                const stmt = this.db.prepare(sql);
                const rows = stmt.all(...params);
                callback(null, rows);
            } else if (sqlLower.startsWith('insert')) {
                const stmt = this.db.prepare(sql);
                const result = stmt.run(...params);
                callback(null, { insertId: result.lastInsertRowid, affectedRows: result.changes });
            } else if (sqlLower.startsWith('update') || sqlLower.startsWith('delete')) {
                const stmt = this.db.prepare(sql);
                const result = stmt.run(...params);
                callback(null, { affectedRows: result.changes });
            } else {
                // Generic execution
                this.db.exec(sql);
                callback(null, {});
            }
        } catch (error) {
            callback(error, null);
        }
    }
    
    connect(callback) {
        callback(null);
    }
    
    end() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = SQLiteAdapter;

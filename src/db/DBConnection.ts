import mysql, { Pool } from 'mysql2/promise';

class DBConnection {
    private static instance: DBConnection;
    private pool: Pool;

    // Private constructor to prevent instantiation
    private constructor() {
        this.pool = mysql.createPool({
            host: '127.0.0.1',        // Replace with your DB host
            user: 'Kevin',     // Replace with your DB user
            password: 'Merlika12345', // Replace with your DB password
            database: 'poker', // Replace with your DB name
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    // Public static method to get the singleton instance
    public static getInstance(): DBConnection {
        if (!DBConnection.instance) {
            DBConnection.instance = new DBConnection();
        }
        return DBConnection.instance;
    }

    // Query method for executing SQL commands
    async query(sql: string, values?: any[]) {
        try {
            const [results] = await this.pool.query(sql, values);
            return results;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    // Get connection method if you need to execute multiple queries in a transaction
    async getConnection() {
        try {
            const connection = await this.pool.getConnection();
            return connection;
        } catch (error) {
            console.error('Error getting database connection:', error);
            throw error;
        }
    }
}

export default DBConnection.getInstance();

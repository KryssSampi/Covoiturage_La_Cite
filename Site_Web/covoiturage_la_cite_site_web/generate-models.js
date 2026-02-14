#!/usr/bin/env node
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';

// ==================== CONFIGURATION ====================
const CONFIG =  {
    host: "pg-26d8eb52-covoituragelacitev1.f.aivencloud.com",
    user: "avnadmin",
    password: "AVNS_5zaAhNTniiqcp-TNb6-",
    port:15099,
    database: "Covoiturage_la_Cite",
  ssl: {
    rejectUnauthorized: false  // Pour connexions distantes
  }
};

const OUTPUT_DIR = './app/models';
const IGNORE_TABLES = ['migrations', 'sessions'];

// ==================== FONCTIONS ====================

function pascalCase(str) {
  return str.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
}

function getTsType(pgType, isNullable) {
  pgType = pgType.toLowerCase();
  let baseType = 'any';
  
  if (['smallint', 'integer', 'bigint', 'int', 'int2', 'int4', 'int8',
       'serial', 'bigserial', 'smallserial'].includes(pgType)) {
    baseType = 'number';
  } else if (['decimal', 'numeric', 'real', 'double precision', 
              'float4', 'float8', 'money'].includes(pgType)) {
    baseType = 'number';
  } else if (['character varying', 'varchar', 'character', 'char', 'text',
            'citext', 'uuid'].includes(pgType)) {
    baseType = 'string';
  } else if (['timestamp', 'timestamp without time zone', 'timestamp with time zone',
            'timestamptz', 'date', 'time', 'time without time zone',
            'time with time zone', 'timetz', 'interval'].includes(pgType)) {
    baseType = 'string';
  } else if (['boolean', 'bool'].includes(pgType)) {
    baseType = 'boolean';
  } else if (['json', 'jsonb'].includes(pgType)) {
    baseType = 'any';
  } else if (pgType.startsWith('ARRAY') || pgType.includes('[]') || pgType.startsWith('_')) {
    let innerType = pgType.replace('ARRAY', '').replace('[]', '').replace('_', '').trim();
    let baseInner = getTsType(innerType, false);
    baseType = `${baseInner}[]`;
  } else if (['inet', 'cidr', 'macaddr', 'macaddr8'].includes(pgType)) {
    baseType = 'string';
  } else if (pgType === 'bytea') {
    baseType = 'Buffer';
  }
  
  return isNullable ? `${baseType} | null` : baseType;
}

function generateInterface(tableName, columns) {
  const className = pascalCase(tableName.replace(/s$/, '')) + 'Model';
  let code = `export class ${className} {\n`;
  
  columns.forEach(col => {
    const field = col.column_name;
    const pgType = col.udt_name || col.data_type;
    const isNullable = col.is_nullable === 'YES';
    const tsType = getTsType(pgType, isNullable);
    const optional = isNullable ? '?' : '';
    code += `  ${field}${optional}: ${tsType};\n`;
  });
  
  code += '\n  constructor(data?: Partial<' + className + '>) {\n';
  code += '    if (data) Object.assign(this, data);\n';
  code += '  }\n';
  code += '}\n';
  return code;
}

// ==================== MAIN ====================

async function main() {
  console.log('🚀 Connexion à PostgreSQL...');
  const pool = new Pool(CONFIG);
  
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Dossier créé: ${OUTPUT_DIR}`);
    
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    let modelsCreated = 0;
    
    for (const table of tables) {
      if (IGNORE_TABLES.includes(table)) {
        console.log(`⏭️  Table ignorée: ${table}`);
        continue;
      }
      
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, udt_name, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      const className = pascalCase(table.replace(/s$/, '')) + 'Model';
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      
      let content = `/* AUTO-GENERATED - ${now} */\n`;
      content += `/* Table: ${table} */\n\n`;
      content += generateInterface(table, columnsResult.rows);
      
      // Sauvegarder chaque classe dans son propre fichier
      const fileName = `${className}.ts`;
      const filePath = path.join(OUTPUT_DIR, fileName);
      await fs.writeFile(filePath, content);
      
      console.log(`✅ ${fileName} créé (${table} - ${columnsResult.rows.length} champs)`);
      modelsCreated++;
    }
    
    // Créer un fichier index.ts pour exporter tous les modèles
    let indexContent = `/* AUTO-GENERATED - ${new Date().toISOString().replace('T', ' ').substring(0, 19)} */\n\n`;
    for (const table of tables) {
      if (!IGNORE_TABLES.includes(table)) {
        const className = pascalCase(table.replace(/s$/, '')) + 'Model';
        indexContent += `export { ${className} } from './${className}';\n`;
      }
    }
    await fs.writeFile(path.join(OUTPUT_DIR, 'index.ts'), indexContent);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 GÉNÉRATION TERMINÉE!');
    console.log('='.repeat(50));
    console.log(`✅ Modèles créés: ${modelsCreated}`);
    console.log(`📁 Dossier: ${OUTPUT_DIR}`);
    console.log(`📄 Index: ${path.join(OUTPUT_DIR, 'index.ts')}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

main();
import React from 'react';
import {
  BookOpen,
  Video,
  BookmarkCheck,
  ShieldAlert,
  Layers,
  Zap,
  Tag,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function LearnSection() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 border border-teal-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2">
          <GraduationCap className="w-4 h-4" />
          <span>Section A • Academic Learning Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          Understanding Database Schema Smells
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          Learn the theoretical foundations, normalization principles, and architectural pitfalls that lead to database schema smells, and explore how automated detection preserves data integrity and query performance.
        </p>
      </div>

      {/* 1. Concept Explanation */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
          <BookOpen className="w-5 h-5 text-teal-500" />
          <h2>1. Comprehensive Concept Explanation</h2>
        </div>

        {/* What is a Schema Smell? */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            What is a "Database Schema Smell"?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            In relational software engineering, Martin Fowler and Kent Beck coined the term <em>"Code Smell"</em> to describe surface symptoms in code that suggest deeper design flaws. Analogously, a <strong>Database Schema Smell</strong> represents a structural, semantic, or constraint anti-pattern in a relational database schema.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Schema smells arise when developers bypass relational calculus, ignore normal forms (1NF, 2NF, 3NF), or disable relational constraints to accelerate early development. While the database may function initially, schema smells introduce <strong>data anomalies</strong>, <strong>concurrency bottlenecks (table-level locks)</strong>, <strong>full table sequential scans</strong>, and <strong>loss of referential integrity</strong> as the application scales.
          </p>
        </div>

        {/* The 4 Core Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dimension 1: Integrity */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <h3>1. Entity & Referential Integrity Smells</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Based on <strong>Codd's Relational Rule #2 (Entity Integrity)</strong> and referential calculus:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li><strong>Missing Primary Key:</strong> Tuples cannot be uniquely distinguished or clustered into B-Tree storage blocks, forcing table scans for updates.</li>
              <li><strong>Missing Foreign Keys:</strong> Column named <code className="text-teal-600 dark:text-teal-400">user_id</code> with no constraint allows orphaned children and dangling records when parents are deleted.</li>
              <li><strong>Circular Foreign Keys:</strong> Table A references Table B while Table B references Table A, preventing deterministic insertions and causing deadlocks.</li>
            </ul>
          </div>

          {/* Dimension 2: Normalization */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 font-bold text-sm">
              <Layers className="w-4 h-4" />
              <h3>2. Normalization & 1NF/2NF/3NF Violations</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Smells violating relational normal forms that create update, insertion, and deletion anomalies:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li><strong>1NF Multivalued Attributes:</strong> Storing delimited tags or phone numbers in a string violates domain atomicity and breaks index searchability.</li>
              <li><strong>God Table / Blob Entity:</strong> Consolidating 15+ columns into one relation causes row-spill across disk blocks and buffer pool thrashing.</li>
              <li><strong>Entity-Attribute-Value (EAV):</strong> Storing generic key/value tuples throws away types and requires quadratic self-joins.</li>
              <li><strong>Metadata Tribbles:</strong> Creating cloned tables per year (<code className="text-teal-600 dark:text-teal-400">orders_2023</code>) instead of native range partitioning.</li>
            </ul>
          </div>

          {/* Dimension 3: Types & Naming */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
              <Tag className="w-4 h-4" />
              <h3>3. Domain Types & Semantic Design</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Misaligned attribute domains that compromise data quality and SQL parser execution:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li><strong>Fear of the Unknown:</strong> Storing dates or currency in <code className="text-teal-600 dark:text-teal-400">VARCHAR</code> breaks interval math, SUM() aggregates, and lexicographical ordering.</li>
              <li><strong>Excessive Nullability:</strong> Tables with &gt;60% NULL columns signify missing subtyping (Single Table Inheritance anti-pattern).</li>
              <li><strong>Boolean Flag Explosion:</strong> Multiple boolean flags masking an unmodeled finite state machine.</li>
            </ul>
          </div>

          {/* Dimension 4: Performance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 font-bold text-sm">
              <Zap className="w-4 h-4" />
              <h3>4. Indexing & Concurrency Performance</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Physical storage and index design issues that degrade transaction throughput:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li><strong>Unindexed Foreign Keys:</strong> Deleting a parent row triggers a full sequential scan on unindexed child tables, escalating locks.</li>
              <li><strong>Duplicate B-Tree Index:</strong> Creating an index on <code className="text-teal-600 dark:text-teal-400">(user_id)</code> when <code className="text-teal-600 dark:text-teal-400">(user_id, created_at)</code> exists doubles write WAL overhead for zero gain.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Animated Educational Video */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
          <Video className="w-5 h-5 text-teal-500" />
          <h2>2. Educational & Animated Video</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Visual Guide: Database Normalization (1NF, 2NF, 3NF) & Schema Design
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This visual guide illustrates how unnormalized schemas produce data redundancies and anomalies, and demonstrates step-by-step mathematical decomposition into 1NF, 2NF, and 3NF.
            </p>
          </div>

          {/* Embedded Video Player */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black shadow-lg">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/GFQaEYEc8_8"
              title="Database Normalization - 1NF, 2NF, 3NF & Schema Design"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
            <strong className="text-teal-600 dark:text-teal-400 font-semibold block mb-1">Key Visual Takeaways:</strong>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>1NF:</strong> Eliminate repeating groups and ensure atomic attribute values.</li>
              <li><strong>2NF:</strong> Remove partial functional dependencies (every non-prime attribute must depend on the whole primary key).</li>
              <li><strong>3NF:</strong> Remove transitive dependencies ($X \rightarrow Y \rightarrow Z$). Non-prime attributes must depend solely on candidate keys.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Academic References & Acknowledgements */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
          <BookmarkCheck className="w-5 h-5 text-teal-500" />
          <h2>3. Academic References & Bibliography</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The design, classification rules, and algorithms implemented in this application are formulated from the following standard textbooks, research literature, and technical standards:
          </p>

          {/* Books */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Textbooks & Authoritative Books
            </h3>
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <strong>Ambler, S. W., & Sadalage, P. J. (2006).</strong> <em>Refactoring Databases: Evolutionary Database Design</em>. Addison-Wesley Professional.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <strong>Karwin, B. (2010).</strong> <em>SQL Antipatterns: Avoiding the Pitfalls of Database Programming</em>. Pragmatic Bookshelf.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <strong>Silberschatz, A., Korth, H. F., & Sudarshan, S. (2019).</strong> <em>Database System Concepts</em> (7th Edition). McGraw-Hill Education.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <strong>Elmasri, R., & Navathe, S. B. (2015).</strong> <em>Fundamentals of Database Systems</em> (7th Edition). Pearson.
              </div>
            </div>
          </div>

          {/* Research Papers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3 flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5" /> Research Papers & Foundational Literature
            </h3>
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <strong>Codd, E. F. (1970).</strong> "A Relational Model of Data for Large Shared Data Banks". <em>Communications of the ACM</em>, 13(6), 377–387.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <strong>Sharma, T., Mishra, P., & Tiwari, R. (2018).</strong> "A Survey on Software Smells in Relational Schemas and Test Code". <em>IEEE Access</em>.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <strong>Curino, C., Moon, H. J., & Zaniolo, C. (2008).</strong> "Automating Database Schema Evolution in Relational Systems". <em>Proceedings of the VLDB Endowment</em>, 1(1), 317–332.
              </div>
            </div>
          </div>

          {/* Educational Resources & Websites */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> Websites & Technical Documentation
            </h3>
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <strong>PostgreSQL Global Development Group (2024).</strong> <em>PostgreSQL 16 Documentation: Chapter 5 (Data Definition) & Chapter 11 (Indexes)</em>. https://www.postgresql.org/docs/
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <strong>MySQL AB / Oracle Corporation (2024).</strong> <em>MySQL 8.0 Reference Manual: Foreign Key Constraints & InnoDB Locking Optimization</em>. https://dev.mysql.com/doc/
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { db, initializeDatabase } from './db.js';
import * as seedData from './seedData.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize the database
initializeDatabase();

// Auto-seed if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
    console.log('Base de données vide. Insertion des données de démonstration...');
    const { users, patients, hearingAids, stockItems, expenses } = seedData;

    db.transaction(() => {
        const insertUser = db.prepare('INSERT INTO users (id, name, email, password, role, avatar, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?)');
        for (const u of users) insertUser.run(u.id, u.name, u.email, u.password, u.role, u.avatar, u.lastLogin);

        const insertPatient = db.prepare('INSERT INTO patients (id, firstName, lastName, age, dateOfBirth, gender, phone, email, address, medicalHistory, audiologicalHistory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        for (const p of patients) insertPatient.run(p.id, p.firstName, p.lastName, p.age, p.dateOfBirth, p.gender, p.phone, p.email, p.address, p.medicalHistory, p.audiologicalHistory);

        const insertAid = db.prepare('INSERT INTO hearing_aids (id, brand, model, technology, type, price, features, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        for (const h of hearingAids) insertAid.run(h.id, h.brand, h.model, h.technology, h.type, h.price, JSON.stringify(h.features), h.image);

        const insertStock = db.prepare('INSERT INTO stock_items (id, name, category, sku, brand, unit, quantity, minQuantity, maxQuantity, purchasePrice, salePrice, location, supplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        for (const s of stockItems) insertStock.run(s.id, s.name, s.category, s.sku, s.brand, s.unit, s.quantity, s.minQuantity, s.maxQuantity, s.purchasePrice, s.salePrice, s.location, s.supplier);

        const insertExpense = db.prepare('INSERT INTO expenses (id, date, category, description, amount, status) VALUES (?, ?, ?, ?, ?, ?)');
        for (const e of expenses) insertExpense.run(e.id, e.date, e.category, e.description, e.amount, e.status);
    })();
    console.log('✅ Démo prête !');
}

// --- AUTH / USERS ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);
    if (user) {
        const lastLogin = new Date().toISOString();
        db.prepare('UPDATE users SET lastLogin = ? WHERE id = ?').run(lastLogin, user.id);
        user.lastLogin = lastLogin;
        delete user.password;
        res.json(user);
    } else {
        res.status(401).json({ error: 'Identifiants incorrects' });
    }
});

app.get('/api/users', (req, res) => {
    const users = db.prepare('SELECT id, name, email, role, avatar, createdAt, lastLogin FROM users').all();
    res.json(users);
});

app.post('/api/users', (req, res) => {
    const { name, email, password, role, avatar } = req.body;
    const id = uuidv4();
    try {
        db.prepare('INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)')
            .run(id, name, email, password, role, avatar);
        res.json({ id, name, email, role, avatar });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/users/:id', (req, res) => {
    const { name, email, role, avatar, password } = req.body;
    if (password) {
        db.prepare('UPDATE users SET name = ?, email = ?, role = ?, avatar = ?, password = ? WHERE id = ?')
            .run(name, email, role, avatar, password, req.params.id);
    } else {
        db.prepare('UPDATE users SET name = ?, email = ?, role = ?, avatar = ? WHERE id = ?')
            .run(name, email, role, avatar, req.params.id);
    }
    res.json({ success: true });
});

app.delete('/api/users/:id', (req, res) => {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- PATIENTS ---
app.get('/api/patients', (req, res) => {
    const patients = db.prepare('SELECT * FROM patients').all();
    res.json(patients);
});

app.post('/api/patients', (req, res) => {
    const patient = req.body;
    const id = patient.id || uuidv4();
    db.prepare(`
    INSERT INTO patients (id, firstName, lastName, age, dateOfBirth, gender, phone, email, address, medicalHistory, audiologicalHistory)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        id, patient.firstName, patient.lastName, patient.age, patient.dateOfBirth,
        patient.gender, patient.phone, patient.email, patient.address,
        patient.medicalHistory, patient.audiologicalHistory
    );
    res.json({ ...patient, id });
});

app.put('/api/patients/:id', (req, res) => {
    const patient = req.body;
    db.prepare(`
    UPDATE patients SET firstName = ?, lastName = ?, age = ?, dateOfBirth = ?, gender = ?, 
    phone = ?, email = ?, address = ?, medicalHistory = ?, audiologicalHistory = ?, lastVisit = ?
    WHERE id = ?
  `).run(
        patient.firstName, patient.lastName, patient.age, patient.dateOfBirth, patient.gender,
        patient.phone, patient.email, patient.address, patient.medicalHistory, patient.audiologicalHistory,
        patient.lastVisit, req.params.id
    );
    res.json({ success: true });
});

app.delete('/api/patients/:id', (req, res) => {
    db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- AUDIOGRAMS ---
app.get('/api/audiograms', (req, res) => {
    const audiograms = db.prepare('SELECT * FROM audiograms').all().map(a => ({
        ...a,
        rightEar: JSON.parse(a.rightEar),
        leftEar: JSON.parse(a.leftEar)
    }));
    res.json(audiograms);
});

app.post('/api/audiograms', (req, res) => {
    const audiogram = req.body;
    const id = audiogram.id || uuidv4();
    db.prepare(`
    INSERT INTO audiograms (id, patientId, date, type, rightEar, leftEar, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
        id, audiogram.patientId, audiogram.date, audiogram.type,
        JSON.stringify(audiogram.rightEar), JSON.stringify(audiogram.leftEar), audiogram.notes
    );
    res.json({ ...audiogram, id });
});

app.put('/api/audiograms/:id', (req, res) => {
    const audiogram = req.body;
    db.prepare(`
    UPDATE audiograms SET patientId = ?, date = ?, type = ?, rightEar = ?, leftEar = ?, notes = ?
    WHERE id = ?
  `).run(
        audiogram.patientId, audiogram.date, audiogram.type,
        JSON.stringify(audiogram.rightEar), JSON.stringify(audiogram.leftEar), audiogram.notes, req.params.id
    );
    res.json({ success: true });
});

app.delete('/api/audiograms/:id', (req, res) => {
    db.prepare('DELETE FROM audiograms WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- HEARING AIDS (CATALOG) ---
app.get('/api/hearing-aids', (req, res) => {
    const aids = db.prepare('SELECT * FROM hearing_aids').all().map(a => ({
        ...a,
        features: JSON.parse(a.features)
    }));
    res.json(aids);
});

app.post('/api/hearing-aids', (req, res) => {
    const aid = req.body;
    const id = aid.id || uuidv4();
    db.prepare(`
    INSERT INTO hearing_aids (id, brand, model, technology, type, price, features, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        id, aid.brand, aid.model, aid.technology, aid.type, aid.price,
        JSON.stringify(aid.features || []), aid.image
    );
    res.json({ ...aid, id });
});

app.put('/api/hearing-aids/:id', (req, res) => {
    const aid = req.body;
    db.prepare(`
    UPDATE hearing_aids SET brand = ?, model = ?, technology = ?, type = ?, price = ?, features = ?, image = ?
    WHERE id = ?
  `).run(
        aid.brand, aid.model, aid.technology, aid.type, aid.price,
        JSON.stringify(aid.features || []), aid.image, req.params.id
    );
    res.json({ success: true });
});

app.delete('/api/hearing-aids/:id', (req, res) => {
    db.prepare('DELETE FROM hearing_aids WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- PATIENT DEVICES ---
app.get('/api/patient-devices', (req, res) => {
    const devices = db.prepare('SELECT * FROM patient_devices').all().map(d => ({
        ...d,
        adjustments: JSON.parse(d.adjustments || '[]')
    }));
    res.json(devices);
});

app.post('/api/patient-devices', (req, res) => {
    const device = req.body;
    const id = device.id || uuidv4();
    db.prepare(`
    INSERT INTO patient_devices (id, patientId, hearingAidId, ear, dateInstalled, warranty, status, adjustments)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        id, device.patientId, device.hearingAidId, device.ear, device.dateInstalled,
        device.warranty, device.status, JSON.stringify(device.adjustments || [])
    );
    res.json({ ...device, id });
});

app.put('/api/patient-devices/:id', (req, res) => {
    const device = req.body;
    db.prepare(`
    UPDATE patient_devices SET patientId = ?, hearingAidId = ?, ear = ?, dateInstalled = ?, warranty = ?, status = ?, adjustments = ?
    WHERE id = ?
  `).run(
        device.patientId, device.hearingAidId, device.ear, device.dateInstalled,
        device.warranty, device.status, JSON.stringify(device.adjustments || []), req.params.id
    );
    res.json({ success: true });
});

app.delete('/api/patient-devices/:id', (req, res) => {
    db.prepare('DELETE FROM patient_devices WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- APPOINTMENTS ---
app.get('/api/appointments', (req, res) => {
    const appointments = db.prepare('SELECT * FROM appointments').all();
    res.json(appointments);
});

app.post('/api/appointments', (req, res) => {
    const apt = req.body;
    const id = apt.id || uuidv4();
    db.prepare(`
    INSERT INTO appointments (id, patientId, date, duration, type, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, apt.patientId, apt.date, apt.duration, apt.type, apt.status, apt.notes);
    res.json({ ...apt, id });
});

app.put('/api/appointments/:id', (req, res) => {
    const apt = req.body;
    db.prepare(`
    UPDATE appointments SET patientId = ?, date = ?, duration = ?, type = ?, status = ?, notes = ?
    WHERE id = ?
  `).run(apt.patientId, apt.date, apt.duration, apt.type, apt.status, apt.notes, req.params.id);
    res.json({ success: true });
});

app.delete('/api/appointments/:id', (req, res) => {
    db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- INVOICES ---
app.get('/api/invoices', (req, res) => {
    const invoices = db.prepare('SELECT * FROM invoices').all().map(i => ({
        ...i,
        items: JSON.parse(i.items || '[]')
    }));
    res.json(invoices);
});

app.post('/api/invoices', (req, res) => {
    const inv = req.body;
    const id = inv.id || uuidv4();
    db.prepare(`
    INSERT INTO invoices (id, patientId, date, amount, status, items, insurance)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, inv.patientId, inv.date, inv.amount, inv.status, JSON.stringify(inv.items || []), inv.insurance);
    res.json({ ...inv, id });
});

app.put('/api/invoices/:id', (req, res) => {
    const inv = req.body;
    db.prepare(`
    UPDATE invoices SET patientId = ?, date = ?, amount = ?, status = ?, items = ?, insurance = ?
    WHERE id = ?
  `).run(inv.patientId, inv.date, inv.amount, inv.status, JSON.stringify(inv.items || []), inv.insurance, req.params.id);
    res.json({ success: true });
});

app.delete('/api/invoices/:id', (req, res) => {
    db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- EXPENSES ---
app.get('/api/expenses', (req, res) => {
    const expenses = db.prepare('SELECT * FROM expenses').all();
    res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
    const exp = req.body;
    const id = exp.id || uuidv4();
    db.prepare(`
    INSERT INTO expenses (id, date, category, description, amount, supplier, status, paymentMethod, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, exp.date, exp.category, exp.description, exp.amount, exp.supplier, exp.status, exp.paymentMethod, exp.notes);
    res.json({ ...exp, id });
});

app.put('/api/expenses/:id', (req, res) => {
    const exp = req.body;
    db.prepare(`
    UPDATE expenses SET date = ?, category = ?, description = ?, amount = ?, supplier = ?, status = ?, paymentMethod = ?, notes = ?
    WHERE id = ?
  `).run(exp.date, exp.category, exp.description, exp.amount, exp.supplier, exp.status, exp.paymentMethod, exp.notes, req.params.id);
    res.json({ success: true });
});

app.delete('/api/expenses/:id', (req, res) => {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- STOCK ITEMS ---
app.get('/api/stock-items', (req, res) => {
    const items = db.prepare('SELECT * FROM stock_items').all();
    res.json(items);
});

app.post('/api/stock-items', (req, res) => {
    const item = req.body;
    const id = item.id || uuidv4();
    db.prepare(`
    INSERT INTO stock_items (id, name, category, sku, brand, unit, quantity, minQuantity, maxQuantity, purchasePrice, salePrice, location, supplier, image, notes, lastRestock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        id, item.name, item.category, item.sku, item.brand, item.unit, item.quantity,
        item.minQuantity, item.maxQuantity, item.purchasePrice, item.salePrice,
        item.location, item.supplier, item.image, item.notes, item.lastRestock
    );
    res.json({ ...item, id });
});

app.put('/api/stock-items/:id', (req, res) => {
    const item = req.body;
    db.prepare(`
    UPDATE stock_items SET name = ?, category = ?, sku = ?, brand = ?, unit = ?, quantity = ?, minQuantity = ?, maxQuantity = ?, purchasePrice = ?, salePrice = ?, location = ?, supplier = ?, image = ?, notes = ?, lastRestock = ?
    WHERE id = ?
  `).run(
        item.name, item.category, item.sku, item.brand, item.unit, item.quantity,
        item.minQuantity, item.maxQuantity, item.purchasePrice, item.salePrice,
        item.location, item.supplier, item.image, item.notes, item.lastRestock, req.params.id
    );
    res.json({ success: true });
});

app.delete('/api/stock-items/:id', (req, res) => {
    db.prepare('DELETE FROM stock_items WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- SEED DATABASE ---
app.post('/api/seed', (req, res) => {
    const { users, patients, audiograms, hearingAids, patientDevices, appointments, invoices, expenses, stockItems } = req.body;

    try {
        const backup = db.transaction(() => {
            if (users) {
                db.prepare('DELETE FROM users').run();
                const insert = db.prepare('INSERT INTO users (id, name, email, password, role, avatar, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?)');
                for (const u of users) if (u) insert.run(u.id, u.name, u.email, u.password || 'password', u.role, u.avatar, u.lastLogin);
            }
            if (patients) {
                db.prepare('DELETE FROM patients').run();
                const insert = db.prepare('INSERT INTO patients (id, firstName, lastName, age, dateOfBirth, gender, phone, email, address, medicalHistory, audiologicalHistory, lastVisit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                for (const p of patients) if (p) insert.run(p.id, p.firstName, p.lastName, p.age, p.dateOfBirth, p.gender, p.phone, p.email, p.address, p.medicalHistory, p.audiologicalHistory, p.lastVisit);
            }
            if (audiograms) {
                db.prepare('DELETE FROM audiograms').run();
                const insert = db.prepare('INSERT INTO audiograms (id, patientId, date, type, rightEar, leftEar, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
                for (const a of audiograms) if (a) insert.run(a.id, a.patientId, a.date, a.type, JSON.stringify(a.rightEar), JSON.stringify(a.leftEar), a.notes);
            }
            if (hearingAids) {
                db.prepare('DELETE FROM hearing_aids').run();
                const insert = db.prepare('INSERT INTO hearing_aids (id, brand, model, technology, type, price, features, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
                for (const h of hearingAids) if (h) insert.run(h.id, h.brand, h.model, h.technology, h.type, h.price, JSON.stringify(h.features || []), h.image);
            }
            if (patientDevices) {
                db.prepare('DELETE FROM patient_devices').run();
                const insert = db.prepare('INSERT INTO patient_devices (id, patientId, hearingAidId, ear, dateInstalled, warranty, status, adjustments) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
                for (const d of patientDevices) if (d) insert.run(d.id, d.patientId, d.hearingAidId, d.ear, d.dateInstalled, d.warranty, d.status, JSON.stringify(d.adjustments || []));
            }
            if (appointments) {
                db.prepare('DELETE FROM appointments').run();
                const insert = db.prepare('INSERT INTO appointments (id, patientId, date, duration, type, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
                for (const a of appointments) if (a) insert.run(a.id, a.patientId, a.date, a.duration, a.type, a.status, a.notes);
            }
            if (invoices) {
                db.prepare('DELETE FROM invoices').run();
                const insert = db.prepare('INSERT INTO invoices (id, patientId, date, amount, status, items, insurance) VALUES (?, ?, ?, ?, ?, ?, ?)');
                for (const i of invoices) if (i) insert.run(i.id, i.patientId, i.date, i.amount, i.status, JSON.stringify(i.items || []), i.insurance);
            }
            if (expenses) {
                db.prepare('DELETE FROM expenses').run();
                const insert = db.prepare('INSERT INTO expenses (id, date, category, description, amount, supplier, status, paymentMethod, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
                for (const e of expenses) if (e) insert.run(e.id, e.date, e.category, e.description, e.amount, e.supplier, e.status, e.paymentMethod, e.notes);
            }
            if (stockItems) {
                db.prepare('DELETE FROM stock_items').run();
                const insert = db.prepare('INSERT INTO stock_items (id, name, category, sku, brand, unit, quantity, minQuantity, maxQuantity, purchasePrice, salePrice, location, supplier, image, notes, lastRestock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                for (const s of stockItems) if (s) insert.run(s.id, s.name, s.category, s.sku, s.brand, s.unit, s.quantity, s.minQuantity, s.maxQuantity, s.purchasePrice, s.salePrice, s.location, s.supplier, s.image, s.notes, s.lastRestock);
            }
        });
        backup();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Serveur Voxia prêt sur http://localhost:${port}`);
});

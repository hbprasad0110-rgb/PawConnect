const bcrypt = require('bcryptjs');
const { env } = require('../../config/env.cjs');

exports.seed = async function seed(knex) {
  await knex('animal_status_history').del();
  await knex('adoptions').del();
  await knex('appointments').del();
  await knex('adoption_applications').del();
  await knex('medical_records').del();
  await knex('animals').del();
  await knex('users').del();

  const adminPassword = env.ADMIN_PASSWORD;
  const adminEmail = env.ADMIN_EMAIL.toLowerCase();
  const [adminId] = await knex('users').insert({
    first_name: 'Admin', last_name: 'User', email: adminEmail,
    phone: '(555) 000-0001', address: 'PawConnect Animal Shelter, Campus Drive',
    password_hash: await bcrypt.hash(adminPassword, 12), role: 'admin'
  });
  const [adopterId] = await knex('users').insert({
    first_name: 'Sarah', last_name: 'Johnson', email: env.DEMO_ADOPTER_EMAIL.toLowerCase(),
    phone: '(555) 234-5678', address: '123 Maple Street, Arlington, TX 76010',
    password_hash: await bcrypt.hash(env.DEMO_ADOPTER_PASSWORD, 12), role: 'adopter'
  });
  const demoPasswordHash = await bcrypt.hash(env.DEMO_ADOPTER_PASSWORD, 12);
  await knex('users').insert([
    { first_name: 'Michael', last_name: 'Lee', email: 'michael.lee@pawconnect.test', phone: '(555) 345-6789', address: '456 Oak Avenue, Arlington, TX 76011', password_hash: demoPasswordHash, role: 'adopter' },
    { first_name: 'Priya', last_name: 'Patel', email: 'priya.patel@pawconnect.test', phone: '(555) 456-7890', address: '789 Cedar Lane, Arlington, TX 76012', password_hash: demoPasswordHash, role: 'adopter' }
  ]);

  await knex('animals').insert([
    { name: 'Buddy', type: 'dog', breed: 'Golden Retriever', age_months: 24, gender: 'male', description: 'Playful, affectionate, house-trained, and great with families.', photo_url: 'https://images.unsplash.com/photo-1583786693544-e352f898888d?w=900&h=650&fit=crop&auto=format', weight: '65 lbs', color: 'Golden', vaccinated: true, neutered: true, microchipped: true, health_summary: 'Healthy and up-to-date on vaccines.', arrival_date: '2026-07-15', intake_reason: 'Owner surrender', status: 'available' },
    { name: 'Luna', type: 'cat', breed: 'Domestic Shorthair', age_months: 12, gender: 'female', description: 'Curious, gentle, litter-trained, and happiest near a sunny window.', photo_url: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=900&h=650&fit=crop&auto=format', weight: '8 lbs', color: 'Brown tabby', vaccinated: true, neutered: true, microchipped: true, health_summary: 'Excellent health. FVRCP and Rabies current.', arrival_date: '2026-08-01', intake_reason: 'Found stray', status: 'available' },
    { name: 'Max', type: 'dog', breed: 'Labrador Mix', age_months: 36, gender: 'male', description: 'Energetic and loyal. Best suited to an active family.', photo_url: 'https://images.unsplash.com/photo-1604606363386-dd3f2357ad87?w=900&h=650&fit=crop&auto=format', weight: '72 lbs', color: 'Brown and white', vaccinated: true, neutered: true, microchipped: false, health_summary: 'Healthy with mild hip dysplasia monitored annually.', arrival_date: '2026-06-20', intake_reason: 'Owner surrender', status: 'application_pending' },
    { name: 'Mochi', type: 'cat', breed: 'Tabby', age_months: 6, gender: 'female', description: 'A bright, playful kitten who enjoys toys and other cats.', photo_url: 'https://images.unsplash.com/photo-1583524505974-6facd53f4597?w=900&h=650&fit=crop&auto=format', weight: '4 lbs', color: 'Cream tabby', vaccinated: true, neutered: false, microchipped: true, health_summary: 'Healthy kitten. First vaccine series complete.', arrival_date: '2026-08-15', intake_reason: 'Surrendered litter', status: 'available' },
    { name: 'Rocky', type: 'dog', breed: 'American Pit Bull Terrier', age_months: 48, gender: 'male', description: 'Gentle, relaxed, and happiest as the only pet in the home.', photo_url: 'https://images.unsplash.com/photo-1675701917667-d654fa82e536?w=900&h=650&fit=crop&auto=format', weight: '58 lbs', color: 'Brindle', vaccinated: true, neutered: true, microchipped: true, health_summary: 'Excellent health and current vaccines.', arrival_date: '2026-05-10', intake_reason: 'Rescue', status: 'available' },
    { name: 'Cleo', type: 'cat', breed: 'Domestic Shorthair', age_months: 24, gender: 'female', description: 'Elegant and patient, currently living with a foster family.', photo_url: 'https://images.unsplash.com/photo-1558618047-f4b511aae74d?w=900&h=650&fit=crop&auto=format', weight: '9 lbs', color: 'Black', vaccinated: true, neutered: true, microchipped: true, health_summary: 'Recovered from a minor respiratory infection.', arrival_date: '2026-07-01', intake_reason: 'Found stray', status: 'fostered' },
    { name: 'Daisy', type: 'dog', breed: 'Beagle', age_months: 60, gender: 'female', description: 'Sweet and curious with an excellent nose for adventure.', photo_url: 'https://images.unsplash.com/photo-1594005374167-5fd900fb82c9?w=900&h=650&fit=crop&auto=format', weight: '25 lbs', color: 'Tri-color', vaccinated: true, neutered: true, microchipped: true, health_summary: 'Excellent health and healthy weight.', arrival_date: '2026-04-15', intake_reason: 'Owner surrender', status: 'approved' },
    { name: 'Oliver', type: 'cat', breed: 'Orange Tabby', age_months: 36, gender: 'male', description: 'Oliver has found his forever home.', photo_url: 'https://images.unsplash.com/photo-1620070687415-4c8e50a042fa?w=900&h=650&fit=crop&auto=format', weight: '11 lbs', color: 'Orange', vaccinated: true, neutered: true, microchipped: true, health_summary: 'Healthy and thriving.', arrival_date: '2026-01-10', intake_reason: 'Owner surrender', status: 'adopted' },
    { name: 'Pepper', type: 'dog', breed: 'Border Collie Mix', age_months: 18, gender: 'female', description: 'Smart, attentive, and eager to learn new routines.', photo_url: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=900&h=650&fit=crop&auto=format', weight: '38 lbs', color: 'Black and white', vaccinated: true, neutered: true, microchipped: true, health_summary: 'Healthy and active.', arrival_date: '2026-09-02', intake_reason: 'Transfer from partner shelter', status: 'available' },
    { name: 'Theo', type: 'cat', breed: 'Siamese Mix', age_months: 84, gender: 'male', description: 'A calm senior cat who enjoys quiet company and soft blankets.', photo_url: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=900&h=650&fit=crop&auto=format', weight: '10 lbs', color: 'Cream and brown', vaccinated: true, neutered: true, microchipped: true, health_summary: 'Managed senior wellness plan.', arrival_date: '2026-08-28', intake_reason: 'Owner relocation', status: 'available' },
    { name: 'Nala', type: 'dog', breed: 'German Shepherd Mix', age_months: 30, gender: 'female', description: 'Confident, affectionate, and comfortable around older children.', photo_url: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=900&h=650&fit=crop&auto=format', weight: '55 lbs', color: 'Tan and black', vaccinated: true, neutered: true, microchipped: true, health_summary: 'Healthy and current on preventive care.', arrival_date: '2026-09-12', intake_reason: 'Found stray', status: 'available' },
    { name: 'Simon', type: 'cat', breed: 'Tuxedo', age_months: 9, gender: 'male', description: 'Social, playful, and always ready to investigate a new toy.', photo_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=900&h=650&fit=crop&auto=format', weight: '7 lbs', color: 'Black and white', vaccinated: true, neutered: true, microchipped: false, health_summary: 'Healthy juvenile cat.', arrival_date: '2026-09-20', intake_reason: 'Found stray', status: 'available' }
  ]);

  const animalRows = await knex('animals')
    .whereIn('name', ['Buddy', 'Luna', 'Daisy', 'Oliver'])
    .select('id', 'name');
  const animalIds = Object.fromEntries(animalRows.map((animal) => [animal.name, animal.id]));

  await knex('medical_records').insert([
    { animal_id: animalIds.Buddy, record_type: 'Intake Exam', description: 'Full physical exam. All clear.', administered_on: '2026-07-15', vet_name: 'Dr. Emily Chen', notes: 'Cleared for adoption.', created_by: adminId },
    { animal_id: animalIds.Buddy, record_type: 'Vaccination', description: 'DHPP and Rabies administered.', administered_on: '2026-07-16', vet_name: 'Dr. Emily Chen', notes: null, created_by: adminId },
    { animal_id: animalIds.Luna, record_type: 'Vaccination', description: 'FVRCP and Rabies administered.', administered_on: '2026-08-10', vet_name: 'Dr. Emily Chen', notes: null, created_by: adminId }
  ]);

  const [approvedApplicationId] = await knex('adoption_applications').insert({ user_id: adopterId, animal_id: animalIds.Daisy, status: 'approved', reason: 'Daisy would be a wonderful companion for my family.', experience: 'More than ten years caring for dogs.', living_arrangement: 'House with a fenced yard', has_yard: true, has_other_pets: false, other_pets_description: '', employment_status: 'Full-time remote employee', references_text: 'Dr. Amy Williams, (555) 111-2222', decision_note: 'Approved for a meet and greet.', decided_by: adminId, decided_at: knex.fn.now() });
  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + 5);
  appointmentDate.setHours(10, 0, 0, 0);
  await knex('appointments').insert({ application_id: approvedApplicationId, user_id: adopterId, animal_id: animalIds.Daisy, starts_at: appointmentDate, status: 'confirmed', notes: 'Meet and greet with Daisy.' });

  const [completedApplicationId] = await knex('adoption_applications').insert({ user_id: adopterId, animal_id: animalIds.Oliver, status: 'completed', reason: 'Oliver is a good fit for my home.', experience: 'Experienced cat owner.', living_arrangement: 'Apartment', has_yard: false, has_other_pets: false, other_pets_description: '', employment_status: 'Full-time remote employee', references_text: 'Dr. Amy Williams, (555) 111-2222', decision_note: 'Adoption completed.', decided_by: adminId, decided_at: knex.fn.now() });
  await knex('adoptions').insert({ application_id: completedApplicationId, user_id: adopterId, animal_id: animalIds.Oliver, adopted_on: '2026-06-15', notes: 'Completed demo adoption.', completed_by: adminId });
};

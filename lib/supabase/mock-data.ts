import type { Testimonial, FAQ } from '@/types';

// Emergency fallback content — ONLY shown if DB has no testimonials/FAQs yet.
// MOCK_VEHICLES removed. The site now exclusively shows real vehicles from the database.

export const MOCK_TESTIMONIALS: any[] = [
  {
    id: 't1',
    customer_name: 'Rajesh Kumar',
    customer_location: 'Janakpuri, Delhi',
    review: 'Great service. I bought a Swift Dzire and the process was absolutely transparent. No hidden charges and paperwork was completed quickly.',
    rating: 5,
    vehicle_purchased: 'Maruti Suzuki Dzire',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sort_order: 1,
  },
  {
    id: 't2',
    customer_name: 'Amit Sharma',
    customer_location: 'Gurugram',
    review: 'Very professional dealers. They helped me evaluate my car and bought it within 24 hours at a very fair price.',
    rating: 5,
    vehicle_purchased: 'Hyundai Verna',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sort_order: 2,
  },
  {
    id: 't3',
    customer_name: 'Priyanka Sen',
    customer_location: 'Noida',
    review: 'Friendly staff and reliable advice. Got an excellent deal on a pre-owned Creta. Highly recommend AutoCapital Wheels.',
    rating: 4,
    vehicle_purchased: 'Hyundai Creta',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sort_order: 3,
  },
];

export const MOCK_FAQS: any[] = [
  {
    id: 'f1',
    question: 'How do you verify the condition of the cars?',
    answer: 'Every car listed on AutoCapital Wheels undergoes inspection. We check mechanical parts, document authenticity, service history, and ensure the vehicle is clean and ready.',
    category: 'General',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sort_order: 1,
  },
  {
    id: 'f2',
    question: 'Can I request a test drive?',
    answer: 'Yes! Simply click "Request Test Drive" or "Get Quotation" on any vehicle card, fill in your phone number, and our team will contact you to schedule it.',
    category: 'Buying',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sort_order: 2,
  },
  {
    id: 'f3',
    question: 'What documentation do you provide?',
    answer: 'We assist with registration transfer (RC transfer), verify insurance validity, PUC status, and check past history logs so you get a completely clear ownership transfer.',
    category: 'Documentation',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sort_order: 3,
  },
];

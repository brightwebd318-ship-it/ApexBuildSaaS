import { firebaseService } from '../services/firebase';
import { db as mockDb } from '../services/db';

describe('Picture Requests & Contractor Photo Response System Integration Tests', () => {
  const mockClientId = 'user_client_arun';
  const mockContractorId = 'user_contractor_1';
  const mockProjectId = 'proj_arun';

  beforeEach(() => {
    // Clear LocalStorage mock database state before each test
    localStorage.clear();
    mockDb.init();
  });

  test('Client can create picture request with proper fields', async () => {
    const requestData = {
      projectId: mockProjectId,
      clientId: mockClientId,
      contractorId: mockContractorId,
      title: 'Foundation Slab Inspection',
      description: 'Need concrete surface finish photos.',
      area: 'Foundation',
      priority: 'High Priority',
      specialNote: 'Ensure crack lines around slab edge are visible.',
      status: 'Pending'
    };

    const res = await firebaseService.addPictureRequest(requestData);
    const requestId = typeof res === 'string' ? res : res.id;
    expect(requestId).toBeDefined();

    // Fetch requests for client
    const clientRequests = await firebaseService.getPictureRequests(mockClientId, 'client');
    expect(clientRequests.length).toBe(1);
    expect(clientRequests[0].id).toBe(requestId);
    expect(clientRequests[0].title).toBe('Foundation Slab Inspection');
    expect(clientRequests[0].area).toBe('Foundation');
    expect(clientRequests[0].priority).toBe('High Priority');
    expect(clientRequests[0].specialNote).toBe('Ensure crack lines around slab edge are visible.');
    expect(clientRequests[0].status).toBe('Pending');
  });

  test('Contractor can view request and update status', async () => {
    const requestData = {
      projectId: mockProjectId,
      clientId: mockClientId,
      contractorId: mockContractorId,
      title: 'Kitchen Drywall Check',
      description: 'Check plumbing behind drywall.',
      area: 'Kitchen',
      priority: 'Normal',
      specialNote: '',
      status: 'Pending'
    };

    const res = await firebaseService.addPictureRequest(requestData);
    const requestId = typeof res === 'string' ? res : res.id;

    // Contractor views request
    await firebaseService.updatePictureRequestStatus(requestId, 'Viewed');

    const contractorRequests = await firebaseService.getPictureRequests(mockContractorId, 'contractor');
    const matched = contractorRequests.find(r => r.id === requestId);
    expect(matched).toBeDefined();
    expect(matched.status).toBe('Viewed');
  });

  test('Contractor can fulfill request with images and client can complete request', async () => {
    const requestData = {
      projectId: mockProjectId,
      clientId: mockClientId,
      contractorId: mockContractorId,
      title: 'Roof Tiling',
      description: 'Check shingles color.',
      area: 'Roof',
      priority: 'Urgent',
      specialNote: '',
      status: 'Pending'
    };

    const res = await firebaseService.addPictureRequest(requestData);
    const requestId = typeof res === 'string' ? res : res.id;

    // Contractor uploads response photos
    const responseData = {
      requestId: requestId,
      contractorId: mockContractorId,
      imageUrls: ['data:image/png;base64,mockimage1', 'data:image/png;base64,mockimage2'],
      caption: 'Roof shingles completed with Charcoal Slate color.'
    };

    await firebaseService.addRequestResponse(responseData);
    await firebaseService.updatePictureRequestStatus(requestId, 'Pictures Sent');

    // Fetch response
    const responses = await firebaseService.getRequestResponses(requestId);
    expect(responses.length).toBe(1);
    expect(responses[0].imageUrls).toEqual(responseData.imageUrls);
    expect(responses[0].caption).toBe(responseData.caption);

    // Verify request status transition to 'Pictures Sent'
    let requests = await firebaseService.getPictureRequests(mockClientId, 'client');
    let targetRequest = requests.find(r => r.id === requestId);
    expect(targetRequest.status).toBe('Pictures Sent');

    // Client marks request as Completed
    await firebaseService.updatePictureRequestStatus(requestId, 'Completed');
    
    requests = await firebaseService.getPictureRequests(mockClientId, 'client');
    targetRequest = requests.find(r => r.id === requestId);
    expect(targetRequest.status).toBe('Completed');
  });

  test('Contractor can send proactive progress updates directly', async () => {
    const proactiveUpdateData = {
      projectId: mockProjectId,
      contractorId: mockContractorId,
      clientId: mockClientId,
      imageUrls: ['data:image/png;base64,proactiveimg1'],
      caption: 'Concrete pouring for site entrance completed today.',
      category: 'Site Entrance'
    };

    const res = await firebaseService.addContractorUpdate(proactiveUpdateData);
    const updateId = typeof res === 'string' ? res : res.id;
    expect(updateId).toBeDefined();

    // Fetch contractor updates
    const updates = await firebaseService.getContractorUpdates(mockProjectId);
    expect(updates.length).toBe(1);
    expect(updates[0].id).toBe(updateId);
    expect(updates[0].caption).toBe('Concrete pouring for site entrance completed today.');
    expect(updates[0].category).toBe('Site Entrance');
    expect(updates[0].imageUrls).toEqual(proactiveUpdateData.imageUrls);
  });
});

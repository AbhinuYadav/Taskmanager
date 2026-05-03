import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { getProjects, createProject, deleteProject, getMembers, createTask } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiFolder, FiPlus, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Helper function to get default due date (30 days from now)
const getDefaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to_id: '',
    due_date: getDefaultDueDate(),
    milestones: [{ title: '', description: '' }]
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, membersRes] = await Promise.all([
        getProjects(),
        getMembers()
      ]);
      setProjects(projectsRes.data);
      setMembers(membersRes.data.filter(m => m.role === 'member'));
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createProject(newProject);
      toast.success('Project created successfully');
      setShowProjectModal(false);
      setNewProject({ name: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        toast.success('Project deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleAddMilestone = () => {
    setNewTask({
      ...newTask,
      milestones: [...newTask.milestones, { title: '', description: '' }]
    });
  };

  const handleRemoveMilestone = (index) => {
    const updatedMilestones = newTask.milestones.filter((_, i) => i !== index);
    setNewTask({ ...newTask, milestones: updatedMilestones });
  };

  const handleMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...newTask.milestones];
    updatedMilestones[index][field] = value;
    setNewTask({ ...newTask, milestones: updatedMilestones });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      setCreating(false);
      return;
    }
    
    if (!newTask.assigned_to_id) {
      toast.error('Please select a member to assign');
      setCreating(false);
      return;
    }
    
    const validMilestones = newTask.milestones.filter(m => m.title && m.title.trim() !== '');
    if (validMilestones.length === 0) {
      toast.error('Please add at least one milestone with a title');
      setCreating(false);
      return;
    }
    
    // Format the date - ALWAYS send a valid due_date
    let formattedDueDate;
    if (newTask.due_date) {
      formattedDueDate = new Date(newTask.due_date).toISOString();
    } else {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      formattedDueDate = defaultDate.toISOString();
    }
    
    const taskData = {
      title: newTask.title,
      description: newTask.description || "",
      project_id: selectedProject.id,
      assigned_to_id: parseInt(newTask.assigned_to_id),
      due_date: formattedDueDate,
      milestones: validMilestones.map(m => ({
        title: m.title,
        description: m.description || ""
      }))
    };
    
    try {
      await createTask(taskData);
      toast.success('Task created successfully!');
      setShowTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        assigned_to_id: '',
        due_date: getDefaultDueDate(),
        milestones: [{ title: '', description: '' }]
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const openTaskModal = (project) => {
    setSelectedProject(project);
    setShowTaskModal(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold">Projects</h1>
          <p className="text-muted">Manage and track all your projects</p>
        </div>
        <Button variant="primary" onClick={() => setShowProjectModal(true)}>
          <FiPlus className="me-2" /> New Project
        </Button>
      </div>

      <Row>
        {projects.map((project) => (
          <Col md={6} lg={4} key={project.id} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="bg-primary bg-opacity-10 p-2 rounded">
                    <FiFolder className="text-primary" size={24} />
                  </div>
                  <Button variant="link" className="text-danger p-0" onClick={() => handleDeleteProject(project.id)}>
                    <FiTrash2 />
                  </Button>
                </div>
                <h5 className="fw-bold mb-2">{project.name}</h5>
                <p className="text-muted small">{project.description || 'No description'}</p>
                <small className="text-muted">Created by {project.creator?.username}</small>
              </Card.Body>
              <Card.Footer className="bg-white border-top-0">
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="flex-grow-1"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    View Tasks
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    className="flex-grow-1"
                    onClick={() => openTaskModal(project)}
                  >
                    <FiCheckCircle className="me-1" /> Add Task
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {projects.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">No projects yet. Click "New Project" to create one.</p>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal show={showProjectModal} onHide={() => setShowProjectModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Project</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateProject}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Project Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter project name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter project description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProjectModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Project'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Create Task Modal */}
      <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Task to "{selectedProject?.name}"</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateTask}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Task Title *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Assign To *</Form.Label>
              <Form.Select
                value={newTask.assigned_to_id}
                onChange={(e) => setNewTask({ ...newTask, assigned_to_id: e.target.value })}
                required
              >
                <option value="">Select a member</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.username} ({member.email})</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
              <Form.Text className="text-muted">
                Leave empty to set default (30 days from now)
              </Form.Text>
            </Form.Group>

            <hr />
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6>Milestones *</h6>
              <Button variant="outline-primary" size="sm" onClick={handleAddMilestone}>
                <FiPlus /> Add Milestone
              </Button>
            </div>

            {newTask.milestones.map((milestone, index) => (
              <div key={index} className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <strong>Milestone {index + 1}</strong>
                  {index > 0 && (
                    <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleRemoveMilestone(index)}>
                      Remove
                    </Button>
                  )}
                </div>
                <Form.Group className="mb-2">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Design Database Schema"
                    value={milestone.title}
                    onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Description (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Create User and Session tables"
                    value={milestone.description}
                    onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                  />
                </Form.Group>
              </div>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowTaskModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={creating}>
              {creating ? 'Creating Task...' : 'Create Task'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Projects;
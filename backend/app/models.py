from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"

class MilestoneStatus(str, enum.Enum):
    NOT_DONE = "not_done"
    WORKING = "working"
    COMPLETED = "completed"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.MEMBER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    projects_created = relationship("Project", back_populates="creator")
    tasks_assigned = relationship("Task", foreign_keys="Task.assigned_to_id", back_populates="assignee")
    milestones_updated = relationship("MilestoneProgress", back_populates="member")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", back_populates="projects_created")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    project_id = Column(Integer, ForeignKey("projects.id"))
    assigned_to_id = Column(Integer, ForeignKey("users.id"))
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime)
    
    # Relationships
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assigned_to_id], back_populates="tasks_assigned")
    milestones = relationship("Milestone", back_populates="task", cascade="all, delete-orphan")

class Milestone(Base):
    __tablename__ = "milestones"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    task = relationship("Task", back_populates="milestones")
    progress = relationship("MilestoneProgress", back_populates="milestone", uselist=False, cascade="all, delete-orphan")

class MilestoneProgress(Base):
    __tablename__ = "milestone_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    milestone_id = Column(Integer, ForeignKey("milestones.id"), unique=True)
    member_id = Column(Integer, ForeignKey("users.id"))
    progress_percentage = Column(Float, default=0)
    status = Column(SQLEnum(MilestoneStatus), default=MilestoneStatus.NOT_DONE)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    milestone = relationship("Milestone", back_populates="progress")
    member = relationship("User", back_populates="milestones_updated")
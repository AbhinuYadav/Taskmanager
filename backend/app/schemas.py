from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"

class MilestoneStatus(str, Enum):
    NOT_DONE = "not_done"
    WORKING = "working"
    COMPLETED = "completed"

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    role: UserRole = UserRole.MEMBER

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None

# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    created_by: int
    created_at: datetime
    creator: UserResponse
    
    class Config:
        from_attributes = True

# Milestone schemas
class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneProgressUpdate(BaseModel):
    progress_percentage: float = Field(ge=0, le=100)

class MilestoneProgressResponse(BaseModel):
    id: int
    milestone_id: int
    member_id: int
    progress_percentage: float
    status: MilestoneStatus
    last_updated: datetime
    
    class Config:
        from_attributes = True

class MilestoneResponse(MilestoneBase):
    id: int
    task_id: int
    created_at: datetime
    progress: Optional[MilestoneProgressResponse] = None
    
    class Config:
        from_attributes = True

# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    project_id: int
    assigned_to_id: int
    milestones: Optional[List[MilestoneCreate]] = []

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to_id: Optional[int] = None
    due_date: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: int
    project_id: int
    assigned_to_id: int
    created_by_id: int
    created_at: datetime
    assignee: UserResponse
    milestones: List[MilestoneResponse] = []
    
    class Config:
        from_attributes = True

# Dashboard schemas
class DashboardStats(BaseModel):
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    overdue_tasks: int

class MemberTaskSummary(BaseModel):
    user: UserResponse
    tasks: List[TaskResponse]
    total_tasks: int
    completed_milestones: int
    overall_progress: float
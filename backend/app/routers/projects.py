from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, auth, dependencies
from ..database import get_db

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.post("/", response_model=schemas.ProjectResponse)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin_user)
):
    db_project = models.Project(
        name=project.name,
        description=project.description,
        created_by=current_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    # Get creator info
    creator = db.query(models.User).filter(models.User.id == db_project.created_by).first()
    creator_response = schemas.UserResponse(
        id=creator.id,
        email=creator.email,
        username=creator.username,
        role=creator.role,
        is_active=creator.is_active,
        created_at=creator.created_at
    )
    
    return schemas.ProjectResponse(
        id=db_project.id,
        name=db_project.name,
        description=db_project.description,
        created_by=db_project.created_by,
        created_at=db_project.created_at,
        creator=creator_response
    )

@router.get("/", response_model=List[schemas.ProjectResponse])
def get_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    projects = db.query(models.Project).all()
    result = []
    for project in projects:
        creator = db.query(models.User).filter(models.User.id == project.created_by).first()
        creator_response = schemas.UserResponse(
            id=creator.id,
            email=creator.email,
            username=creator.username,
            role=creator.role,
            is_active=creator.is_active,
            created_at=creator.created_at
        )
        result.append(schemas.ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            created_by=project.created_by,
            created_at=project.created_at,
            creator=creator_response
        ))
    return result

@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    project = dependencies.get_project(db, project_id)
    creator = db.query(models.User).filter(models.User.id == project.created_by).first()
    creator_response = schemas.UserResponse(
        id=creator.id,
        email=creator.email,
        username=creator.username,
        role=creator.role,
        is_active=creator.is_active,
        created_at=creator.created_at
    )
    return schemas.ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        created_by=project.created_by,
        created_at=project.created_at,
        creator=creator_response
    )

@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(
    project_id: int,
    project_update: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin_user)
):
    project = dependencies.get_project(db, project_id)
    project.name = project_update.name
    project.description = project_update.description
    db.commit()
    db.refresh(project)
    
    creator = db.query(models.User).filter(models.User.id == project.created_by).first()
    creator_response = schemas.UserResponse(
        id=creator.id,
        email=creator.email,
        username=creator.username,
        role=creator.role,
        is_active=creator.is_active,
        created_at=creator.created_at
    )
    return schemas.ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        created_by=project.created_by,
        created_at=project.created_at,
        creator=creator_response
    )

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin_user)
):
    project = dependencies.get_project(db, project_id)
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}
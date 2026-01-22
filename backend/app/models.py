from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, DECIMAL, JSON, TypeDecorator
import uuid
import datetime
from .database import Base

# Wrapper for JSON to work on both Postgres (JSONB) and SQLite (JSON)
class SafeJSON(JSON):
    pass

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime)
    is_active = Column(Boolean, default=True)
    subscription_tier = Column(String(50), default="free")

    from sqlalchemy.orm import relationship
    projects = relationship("APIProject", back_populates="user")
    keys = relationship("APIKey", back_populates="user")

class APIProject(Base):
    __tablename__ = "api_projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    source_url = Column(Text)
    source_type = Column(String(50))
    api_spec = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    last_synced_at = Column(DateTime)
    is_public = Column(Boolean, default=False)

    from sqlalchemy.orm import relationship
    user = relationship("User", back_populates="projects")
    endpoints = relationship("APIEndpoint", back_populates="project")
    sdks = relationship("GeneratedSDK", back_populates="project")
    changes = relationship("APIChange", back_populates="project")

class GeneratedSDK(Base):
    __tablename__ = "generated_sdks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("api_projects.id", ondelete="CASCADE"))
    language = Column(String(50), nullable=False)
    version = Column(String(50), nullable=False)
    code_content = Column(Text, nullable=False)
    test_content = Column(Text)
    documentation = Column(Text)
    config = Column(JSON)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    download_count = Column(Integer, default=0)

    from sqlalchemy.orm import relationship
    project = relationship("APIProject", back_populates="sdks")

class APIEndpoint(Base):
    __tablename__ = "api_endpoints"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("api_projects.id", ondelete="CASCADE"))
    method = Column(String(10), nullable=False)
    path = Column(Text, nullable=False)
    summary = Column(Text)
    description = Column(Text)
    parameters = Column(JSON)
    request_body = Column(JSON)
    responses = Column(JSON)
    tags = Column(JSON) # Changed from ARRAY to JSON for SQLite compatibility
    is_deprecated = Column(Boolean, default=False)

    from sqlalchemy.orm import relationship
    project = relationship("APIProject", back_populates="endpoints")

class APIChange(Base):
    __tablename__ = "api_changes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("api_projects.id", ondelete="CASCADE"))
    change_type = Column(String(50), nullable=False)
    old_version = Column(String(50))
    new_version = Column(String(50))
    changes_json = Column(JSON, nullable=False)
    impact_score = Column(DECIMAL(3, 2))
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)

    from sqlalchemy.orm import relationship
    project = relationship("APIProject", back_populates="changes")

class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    key_name = Column(String(100), nullable=False)
    key_hash = Column(String(255), nullable=False)
    last_used_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)

    from sqlalchemy.orm import relationship
    user = relationship("User", back_populates="keys")

package com.aloha.teamproject.common.service;

import java.util.List;

public interface BaseCrudService<T> {

    List<T> list() throws Exception;

    T selectById(String id) throws Exception;

    T selectByUsername(String username) throws Exception;

    boolean insert(T entity) throws Exception;

    boolean update(T entity) throws Exception;

    boolean delete(Long no) throws Exception;
    
}

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.createTable(
                    'users',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        fullname: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        username: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true,
                            unique: true
                        },
                        email: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'test_version',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        git_repo: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        git_tag: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        git_hash: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        git_commit_msg: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        datetime: {
                            type: Sequelize.DataTypes.DATE,
                            allowNull: true
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'session',
                    {
                        sid: {
                            type: Sequelize.DataTypes.STRING,
                            allowNull: false,
                            primaryKey: true
                        },
                        sess: {
                            type: Sequelize.DataTypes.JSON,
                            allowNull: false
                        },
                        expire: {
                            type: Sequelize.DataTypes.DATE,
                            allowNull: false
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'test_status',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        name: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'role',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        name: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true,
                            unique: true
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'browser',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        name: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true,
                            unique: true
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'browser_version',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true,
                            unique: true // NOTE: Added
                        },
                        browser_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'browser',
                                key: 'id'
                            },
                            unique: true
                        },
                        version: {
                            type: Sequelize.DataTypes.STRING,
                            allowNull: true,
                            primaryKey: true
                        },
                        release_order: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: true
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'at_name',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true,
                            unique: true // NOTE: No in flyway db
                        },
                        name: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true,
                            unique: true
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'test_version',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        git_repo: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        git_tag: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        git_hash: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        git_commit_msg: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        datetime: {
                            type: Sequelize.DataTypes.DATE,
                            allowNull: true
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'at',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        key: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        at_name_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'at_name',
                                key: 'id'
                            }
                        },
                        test_version_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'test_version',
                                key: 'id'
                            }
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'at_version',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true,
                            unique: true // NOTE: Added
                        },
                        at_name_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'at_name',
                                key: 'id'
                            },
                            unique: true
                        },
                        version: {
                            type: Sequelize.DataTypes.STRING,
                            allowNull: true,
                            primaryKey: true
                        },
                        release_order: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: true
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'apg_example',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        directory: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        name: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        test_version_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'test_version',
                                key: 'id'
                            }
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'test',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        name: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        file: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        execution_order: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: true
                        },
                        apg_example_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'apg_example',
                                key: 'id'
                            }
                        },
                        test_version_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'test_version',
                                key: 'id'
                            }
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'test_to_at',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        test_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'test',
                                key: 'id'
                            }
                        },
                        at_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'at',
                                key: 'id'
                            }
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'test_cycle',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        name: {
                            type: Sequelize.DataTypes.TEXT,
                            allowNull: true
                        },
                        test_version_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'test_version',
                                key: 'id'
                            }
                        },
                        created_user_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'users',
                                key: 'id'
                            }
                        },
                        date: {
                            type: Sequelize.DataTypes.DATEONLY,
                            allowNull: true
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'run',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        test_cycle_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'test_cycle',
                                key: 'id'
                            }
                        },
                        at_version_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'at_version',
                                key: 'id'
                            }
                        },
                        at_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'at',
                                key: 'id'
                            }
                        },
                        browser_version_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'browser_version',
                                key: 'id'
                            }
                        },
                        apg_example_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'apg_example',
                                key: 'id'
                            }
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'user_to_role',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        user_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'users',
                                key: 'id'
                            },
                            unique: true
                        },
                        role_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'role',
                                key: 'id'
                            }
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'user_to_at',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        at_name_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'at_name',
                                key: 'id'
                            },
                            unique: true
                        },
                        user_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'users',
                                key: 'id'
                            }
                        },
                        active: {
                            type: Sequelize.DataTypes.BOOLEAN,
                            allowNull: true
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'tester_to_run',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        run_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'run',
                                key: 'id'
                            }
                        },
                        user_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'users',
                                key: 'id'
                            }
                        }
                    },
                    {
                        transaction: t
                    }
                ),
                queryInterface.createTable(
                    'test_result',
                    {
                        id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true
                        },
                        test_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'test',
                                key: 'id'
                            }
                        },
                        run_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'run',
                                key: 'id'
                            }
                        },
                        user_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'users',
                                key: 'id'
                            }
                        },
                        status_id: {
                            type: Sequelize.DataTypes.INTEGER,
                            allowNull: true,
                            references: {
                                model: 'test_status',
                                key: 'id'
                            }
                        },
                        result: {
                            type: Sequelize.DataTypes.JSON,
                            allowNull: true
                        }
                    },
                    {
                        transaction: t
                    }
                )
            ]);
        });
    },
    down: queryInterface => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.dropTable('test_result', { transaction: t }),
                queryInterface.dropTable('tester_to_run', { transaction: t }),
                queryInterface.dropTable('user_to_at', { transaction: t }),
                queryInterface.dropTable('user_to_role', { transaction: t }),
                queryInterface.dropTable('run', { transaction: t }),
                queryInterface.dropTable('test_cycle', { transaction: t }),
                queryInterface.dropTable('test_to_at', { transaction: t }),
                queryInterface.dropTable('test', { transaction: t }),
                queryInterface.dropTable('apg_example', { transaction: t }),
                queryInterface.dropTable('at_version', { transaction: t }),
                queryInterface.dropTable('at', { transaction: t }),
                queryInterface.dropTable('test_version', { transaction: t }),
                queryInterface.dropTable('at_name', { transaction: t }),
                queryInterface.dropTable('browser_version', { transaction: t }),
                queryInterface.dropTable('browser', { transaction: t }),
                queryInterface.dropTable('role', { transaction: t }),
                queryInterface.dropTable('test_status', { transaction: t }),
                queryInterface.dropTable('session', { transaction: t }),
                queryInterface.dropTable('test_version', { transaction: t }),
                queryInterface.dropTable('users', { transaction: t })
            ]);
        });
    }
};

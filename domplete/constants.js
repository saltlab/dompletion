define(function(require, exports, module) {
	"use strict";
	var expressions = {
		AssignmentExpression: 'AssignmentExpression',
    	ArrayExpression: 'ArrayExpression',
    	BlockStatement: 'BlockStatement',
    	BinaryExpression: 'BinaryExpression',
    	BreakStatement: 'BreakStatement',
		CallExpression: 'CallExpression',
    	CatchClause: 'CatchClause',
		ConditionalExpression: 'ConditionalExpression',
		ContinueStatement: 'ContinueStatement',
		DoWhileStatement: 'DoWhileStatement',
		DebuggerStatement: 'DebuggerStatement',
		EmptyStatement: 'EmptyStatement',
	   	ExpressionStatement: 'ExpressionStatement',
    	ForStatement: 'ForStatement',
    	ForInStatement: 'ForInStatement',
    	FunctionDeclaration: 'FunctionDeclaration',
    	FunctionExpression: 'FunctionExpression',
    	Identifier: 'Identifier',
    	IfStatement: 'IfStatement',
    	Literal: 'Literal',
    	LabeledStatement: 'LabeledStatement',
    	LogicalExpression: 'LogicalExpression',
    	MemberExpression: 'MemberExpression',
    	NewExpression: 'NewExpression',
    	ObjectExpression: 'ObjectExpression',
    	Program: 'Program',
    	Property: 'Property',
    	ReturnStatement: 'ReturnStatement',
    	SequenceExpression: 'SequenceExpression',
    	SwitchStatement: 'SwitchStatement',
    	SwitchCase: 'SwitchCase',
    	ThisExpression: 'ThisExpression',
    	ThrowStatement: 'ThrowStatement',
    	TryStatement: 'TryStatement',
    	UnaryExpression: 'UnaryExpression',
    	UpdateExpression: 'UpdateExpression',
    	VariableDeclaration: 'VariableDeclaration',
    	VariableDeclarator: 'VariableDeclarator',
    	WhileStatement: 'WhileStatement',
    	WithStatement: 'WithStatement'
	};
	
	var regex = {
		DOMAccessRegex : "[a-zA-Z_0-9\$\-]+(\.getElementById\\(.*\\)|\.getElementsByTagName\\(.*\\)|\.getElementsByClassName\\(.*\\))*(\.getElementById\\(['\"]|\.getElementsByTagName\\(['\"]|\.getElementsByClassName\\(['\"])[a-zA-Z_0-9_\-]*$"
    };

	exports.expressions = expressions;
	exports.regex = regex;
});